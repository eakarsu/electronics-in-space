const jwt=require('jsonwebtoken');
const pool=require('../db');
const ISSUER='spacelab'; const AUDIENCE='spacelab-console';
async function verifyToken(req,res,next){
  const match=/^Bearer\s+(.+)$/i.exec(req.headers.authorization||'');
  if(!match)return res.status(401).json({error:'Authentication required'});
  try{
    const claims=jwt.verify(match[1],process.env.JWT_SECRET,{algorithms:['HS256'],issuer:ISSUER,audience:AUDIENCE});
    const user=(await pool.query('SELECT id,email,name,role,tenant_id,token_version FROM users WHERE id=$1 AND active=true',[claims.sub])).rows[0];
    if(!user||Number(user.token_version)!==Number(claims.ver))return res.status(401).json({error:'Authentication expired'});
    req.user=user;return next();
  }catch(error){if(error.code)return next(error);return res.status(401).json({error:'Invalid or expired token'});}
}
function requireRole(...roles){const allowed=new Set(roles);return(req,res,next)=>req.user&&allowed.has(req.user.role)?next():res.status(403).json({error:'Insufficient role'});}
module.exports={AUDIENCE,ISSUER,requireRole,verifyToken};
