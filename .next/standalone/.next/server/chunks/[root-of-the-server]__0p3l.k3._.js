module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},95735,e=>{"use strict";var t=e.i(54799);let r=globalThis,s=r.__mobileWebcamPairingStore??{sessions:new Map,messages:[]};r.__mobileWebcamPairingStore=s,e.s(["newId",0,function(e){return`${e}_${t.default.randomBytes(8).toString("hex")}`},"pairingStore",0,s])},77567,e=>e.a(async(t,r)=>{try{var s=e.i(79371),i=e.i(18899),n=t([s]);[s]=n.then?(await n)():n;let a=null;e.s(["ensureSchema",0,function(){return a||(a=(async()=>{await s.db.execute(i.sql`
        CREATE TABLE IF NOT EXISTS pairing_sessions (
          id text PRIMARY KEY,
          token text NOT NULL UNIQUE,
          computer_name text NOT NULL DEFAULT 'WINDOWS-PC',
          status text NOT NULL DEFAULT 'active',
          created_at timestamp NOT NULL DEFAULT now(),
          expires_at timestamp NOT NULL,
          expiration_minutes integer NOT NULL DEFAULT 5,
          connection_type text NOT NULL DEFAULT 'same_wifi',
          paired_at timestamp,
          paired_device_id text,
          client_ip text
        );
        CREATE TABLE IF NOT EXISTS connection_logs (
          id text PRIMARY KEY,
          session_id text,
          device_id text,
          device_name text NOT NULL,
          connection_type text NOT NULL,
          event text NOT NULL,
          details text,
          timestamp timestamp NOT NULL DEFAULT now(),
          duration_seconds integer
        );
        CREATE TABLE IF NOT EXISTS webrtc_signaling (
          id text PRIMARY KEY,
          session_id text NOT NULL,
          sender text NOT NULL,
          type text NOT NULL,
          payload text NOT NULL,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS webrtc_signaling_session_created_idx
          ON webrtc_signaling (session_id, created_at);
      `)})().catch(e=>{throw a=null,e})),a}]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0p3l.k3._.js.map