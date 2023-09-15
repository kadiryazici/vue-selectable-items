import{g as G,n as R,p as V,u as b}from"./index.612d51d9.js";var L=typeof navigator<"u"?navigator.userAgent.toLowerCase().indexOf("firefox")>0:!1;function C(e,t,n,i){e.addEventListener?e.addEventListener(t,n,i):e.attachEvent&&e.attachEvent("on".concat(t),function(){n(window.event)})}function H(e,t){for(var n=t.slice(0,t.length-1),i=0;i<n.length;i++)n[i]=e[n[i].toLowerCase()];return n}function U(e){typeof e!="string"&&(e=""),e=e.replace(/\s/g,"");for(var t=e.split(","),n=t.lastIndexOf("");n>=0;)t[n-1]+=",",t.splice(n,1),n=t.lastIndexOf("");return t}function X(e,t){for(var n=e.length>=t.length?e:t,i=e.length>=t.length?t:e,f=!0,a=0;a<n.length;a++)i.indexOf(n[a])===-1&&(f=!1);return f}var _={backspace:8,"\u232B":8,tab:9,clear:12,enter:13,"\u21A9":13,return:13,esc:27,escape:27,space:32,left:37,up:38,right:39,down:40,del:46,delete:46,ins:45,insert:45,home:36,end:35,pageup:33,pagedown:34,capslock:20,num_0:96,num_1:97,num_2:98,num_3:99,num_4:100,num_5:101,num_6:102,num_7:103,num_8:104,num_9:105,num_multiply:106,num_add:107,num_enter:108,num_subtract:109,num_decimal:110,num_divide:111,"\u21EA":20,",":188,".":190,"/":191,"`":192,"-":L?173:189,"=":L?61:187,";":L?59:186,"'":222,"[":219,"]":221,"\\":220},K={"\u21E7":16,shift:16,"\u2325":18,alt:18,option:18,"\u2303":17,ctrl:17,control:17,"\u2318":91,cmd:91,command:91},S={16:"shiftKey",18:"altKey",17:"ctrlKey",91:"metaKey",shiftKey:16,ctrlKey:17,altKey:18,metaKey:91},c={16:!1,18:!1,17:!1,91:!1},l={};for(var x=1;x<20;x++)_["f".concat(x)]=111+x;var s=[],j=!1,D="all",z=[],M=function(t){return _[t.toLowerCase()]||K[t.toLowerCase()]||t.toUpperCase().charCodeAt(0)};function F(e){D=e||"all"}function E(){return D||"all"}function $(){return s.slice(0)}function q(e){var t=e.target||e.srcElement,n=t.tagName,i=!0;return(t.isContentEditable||(n==="INPUT"||n==="TEXTAREA"||n==="SELECT")&&!t.readOnly)&&(i=!1),i}function J(e){return typeof e=="string"&&(e=M(e)),s.indexOf(e)!==-1}function N(e,t){var n,i;e||(e=E());for(var f in l)if(Object.prototype.hasOwnProperty.call(l,f))for(n=l[f],i=0;i<n.length;)n[i].scope===e?n.splice(i,1):i++;E()===e&&F(t||"all")}function Q(e){var t=e.keyCode||e.which||e.charCode,n=s.indexOf(t);if(n>=0&&s.splice(n,1),e.key&&e.key.toLowerCase()==="meta"&&s.splice(0,s.length),(t===93||t===224)&&(t=91),t in c){c[t]=!1;for(var i in K)K[i]===t&&(g[i]=!1)}}function W(e){if(typeof e>"u")Object.keys(l).forEach(function(o){return delete l[o]});else if(Array.isArray(e))e.forEach(function(o){o.key&&P(o)});else if(typeof e=="object")e.key&&P(e);else if(typeof e=="string"){for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];var f=n[0],a=n[1];typeof f=="function"&&(a=f,f=""),P({key:e,scope:f,method:a,splitKey:"+"})}}var P=function(t){var n=t.key,i=t.scope,f=t.method,a=t.splitKey,o=a===void 0?"+":a,u=U(n);u.forEach(function(d){var p=d.split(o),y=p.length,m=p[y-1],r=m==="*"?"*":M(m);if(!!l[r]){i||(i=E());var h=y>1?H(K,p):[];l[r]=l[r].filter(function(v){var O=f?v.method===f:!0;return!(O&&v.scope===i&&X(v.mods,h))})}})};function T(e,t,n,i){if(t.element===i){var f;if(t.scope===n||t.scope==="all"){f=t.mods.length>0;for(var a in c)Object.prototype.hasOwnProperty.call(c,a)&&(!c[a]&&t.mods.indexOf(+a)>-1||c[a]&&t.mods.indexOf(+a)===-1)&&(f=!1);(t.mods.length===0&&!c[16]&&!c[18]&&!c[17]&&!c[91]||f||t.shortcut==="*")&&t.method(e,t)===!1&&(e.preventDefault?e.preventDefault():e.returnValue=!1,e.stopPropagation&&e.stopPropagation(),e.cancelBubble&&(e.cancelBubble=!0))}}}function B(e,t){var n=l["*"],i=e.keyCode||e.which||e.charCode;if(!!g.filter.call(this,e)){if((i===93||i===224)&&(i=91),s.indexOf(i)===-1&&i!==229&&s.push(i),["ctrlKey","altKey","shiftKey","metaKey"].forEach(function(v){var O=S[v];e[v]&&s.indexOf(O)===-1?s.push(O):!e[v]&&s.indexOf(O)>-1?s.splice(s.indexOf(O),1):v==="metaKey"&&e[v]&&s.length===3&&(e.ctrlKey||e.shiftKey||e.altKey||(s=s.slice(s.indexOf(O))))}),i in c){c[i]=!0;for(var f in K)K[f]===i&&(g[f]=!0);if(!n)return}for(var a in c)Object.prototype.hasOwnProperty.call(c,a)&&(c[a]=e[S[a]]);e.getModifierState&&!(e.altKey&&!e.ctrlKey)&&e.getModifierState("AltGraph")&&(s.indexOf(17)===-1&&s.push(17),s.indexOf(18)===-1&&s.push(18),c[17]=!0,c[18]=!0);var o=E();if(n)for(var u=0;u<n.length;u++)n[u].scope===o&&(e.type==="keydown"&&n[u].keydown||e.type==="keyup"&&n[u].keyup)&&T(e,n[u],o,t);if(i in l){for(var d=0;d<l[i].length;d++)if((e.type==="keydown"&&l[i][d].keydown||e.type==="keyup"&&l[i][d].keyup)&&l[i][d].key){for(var p=l[i][d],y=p.splitKey,m=p.key.split(y),r=[],h=0;h<m.length;h++)r.push(M(m[h]));r.sort().join("")===s.sort().join("")&&T(e,p,o,t)}}}}function Y(e){return z.indexOf(e)>-1}function g(e,t,n){s=[];var i=U(e),f=[],a="all",o=document,u=0,d=!1,p=!0,y="+",m=!1;for(n===void 0&&typeof t=="function"&&(n=t),Object.prototype.toString.call(t)==="[object Object]"&&(t.scope&&(a=t.scope),t.element&&(o=t.element),t.keyup&&(d=t.keyup),t.keydown!==void 0&&(p=t.keydown),t.capture!==void 0&&(m=t.capture),typeof t.splitKey=="string"&&(y=t.splitKey)),typeof t=="string"&&(a=t);u<i.length;u++)e=i[u].split(y),f=[],e.length>1&&(f=H(K,e)),e=e[e.length-1],e=e==="*"?"*":M(e),e in l||(l[e]=[]),l[e].push({keyup:d,keydown:p,scope:a,mods:f,shortcut:i[u],method:n,key:i[u],splitKey:y,element:o});typeof o<"u"&&!Y(o)&&window&&(z.push(o),C(o,"keydown",function(r){B(r,o)},m),j||(j=!0,C(window,"focus",function(){s=[]},m)),C(o,"keyup",function(r){B(r,o),Q(r)},m))}function Z(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"all";Object.keys(l).forEach(function(n){var i=l[n].find(function(f){return f.scope===t&&f.shortcut===e});i&&i.method&&i.method()})}var A={setScope:F,getScope:E,deleteScope:N,getPressedKeyCodes:$,isPressed:J,filter:q,trigger:Z,unbind:W,keyMap:_,modifier:K,modifierMap:S};for(var k in A)Object.prototype.hasOwnProperty.call(A,k)&&(g[k]=A[k]);if(typeof window<"u"){var I=window.hotkeys;g.noConflict=function(e){return e&&window.hotkeys===g&&(window.hotkeys=I),g},window.hotkeys=g}const ee=e=>e[e.length-1],te=()=>{var e;return document.activeElement instanceof HTMLTextAreaElement||((e=document.activeElement)==null?void 0:e.hasAttribute("contenteditable"))||document.activeElement instanceof HTMLInputElement||document.activeElement instanceof HTMLSelectElement};g.filter=()=>!0;const w=new Map;function ne(e,t,{source:n,input:i=!1,prevent:f=!1,repeat:a=!1,stop:o=!1}={}){let u=!1;const d=e.split(",").map(r=>r.trim()).filter(Boolean),p=(r,h)=>{!b(i)&&te()||(b(f)&&r.preventDefault(),b(o)&&r.stopPropagation(),!(!b(a)&&r.repeat)&&t(r,h))},y=()=>{if(!u){u=!0;for(const r of d)w.has(r)?w.set(r,[...w.get(r),p]):(w.set(r,[p]),g(r,(...h)=>{ee(w.get(r))(...h)}))}},m=()=>{if(!!u){u=!1;for(const r of d)w.set(r,w.get(r).filter(h=>h!==p)),w.get(r).length===0&&(w.delete(r),g.unbind(r))}};n?G(n,r=>{r?y():m()},{immediate:!0,flush:"post"}):R(y),V(m)}export{ne as u};
