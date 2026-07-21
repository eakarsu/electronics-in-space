const crypto = require('node:crypto');
const ZERO = '0'.repeat(64);

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function key() {
  if (!process.env.AUDIT_CHAIN_KEY || process.env.AUDIT_CHAIN_KEY.length<32) throw new Error('AUDIT_CHAIN_KEY must be at least 32 characters');
  return process.env.AUDIT_CHAIN_KEY;
}
function hash(payload) { return crypto.createHmac('sha256', key()).update(stable(payload)).digest('hex'); }
async function appendAudit(client, { tenantId, actorUserId=null, actorLabel, action, entityType, entityId=null, details={} }) {
  await client.query('SELECT pg_advisory_xact_lock($1,$2)', [6419, Number(tenantId)]);
  const previousHash = (await client.query('SELECT event_hash FROM audit_history WHERE tenant_id=$1 ORDER BY id DESC LIMIT 1', [tenantId])).rows[0]?.event_hash || ZERO;
  const createdAt = new Date().toISOString();
  const payload = { tenantId:String(tenantId), actorUserId:actorUserId==null?null:String(actorUserId), actorLabel, action, entityType, entityId:entityId==null?null:String(entityId), details, previousHash, createdAt };
  const eventHash = hash(payload);
  return (await client.query(
    `INSERT INTO audit_history(tenant_id,actor_user_id,actor_label,action,entity_type,entity_id,details,previous_hash,event_hash,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [tenantId,actorUserId,actorLabel,action,entityType,entityId==null?null:String(entityId),details,previousHash,eventHash,createdAt],
  )).rows[0];
}
async function verifyAudit(client, tenantId) {
  const rows=(await client.query('SELECT * FROM audit_history WHERE tenant_id=$1 ORDER BY id',[tenantId])).rows;
  let previousHash=ZERO;
  for(const row of rows){
    const expected=hash({tenantId:String(row.tenant_id),actorUserId:row.actor_user_id==null?null:String(row.actor_user_id),actorLabel:row.actor_label,action:row.action,entityType:row.entity_type,entityId:row.entity_id==null?null:String(row.entity_id),details:row.details,previousHash,createdAt:new Date(row.created_at).toISOString()});
    if(row.previous_hash!==previousHash||row.event_hash!==expected)return{valid:false,checked:rows.length,failedId:row.id};
    previousHash=row.event_hash;
  }
  return {valid:true,checked:rows.length,head:previousHash};
}
module.exports={appendAudit,stable,verifyAudit};
