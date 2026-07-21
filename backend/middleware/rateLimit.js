const buckets=new Map(); let nextSweep=0;
function rateLimit({windowMs=60000,max=100,key=(req)=>req.ip}={}){return(req,res,next)=>{const now=Date.now();if(now>=nextSweep){for(const[k,v]of buckets)if(v.resetAt<=now)buckets.delete(k);nextSweep=now+60000;}const id=String(key(req)||'unknown');const current=buckets.get(id);const bucket=!current||current.resetAt<=now?{count:0,resetAt:now+windowMs}:current;bucket.count++;buckets.set(id,bucket);if(bucket.count>max)return res.status(429).json({error:'Rate limit exceeded'});return next();};}
module.exports={rateLimit};
