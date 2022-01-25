(function(){window.onerror=function(a,e,n,t,s){window.parent.postMessage({type:"console",method:"string",data:[a,e,n,t,s].map((function(a){return handleData(a)}))})},window.addEventListener("unhandledrejection",(function(a){window.parent.postMessage({type:"console",method:"string",data:[handleData(a.reason.stack)]})}));var type=function(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()},stringify=function a(e,n,t,s){var c=type(e),o="",r=0,i=t?"":",",l=handleData(e),d="string"===l.contentType?'"':"";switch(c){case"object":if(s.includes(e))o+='<span class="string">检测到循环引用</span>';else{s.push(e);var p=Object.keys(e);(r=p.length)<=0?o+=n?'<span class="bracket">{ }'.concat(i,"</span>"):'<div class="bracket">{ }'.concat(i,"</div>"):(o+='<span class="el-icon-arrow-right expandBtn"></span>',o+=n?'<span class="bracket">{</span>':'<div class="bracket">{</div>',o+='<div class="wrap">',p.forEach((function(n,t){var c=["object","array"].includes(type(e[n]));o+='\n                                <div class="object">\n                                    <span class="key">"'.concat(n,'"</span>\n                                    <span class="colon">:</span>\n                                    ').concat(a(e[n],!0,t>=r-1,s)).concat(t<r-1&&!c?",":"","\n                                </div>")})),o+="</div>",o+='<div class="bracket">}'.concat(i,"</div>"))}break;case"array":s.includes(e)?o+='<span class="string">检测到循环引用</span>':(s.push(e),(r=e.length)<=0?o+=n?'<span class="bracket">[ ]'.concat(i,"</span>"):'<div class="bracket">[ ]'.concat(i,"</div>"):(o+='<span class="el-icon-arrow-right expandBtn"></span>',o+=n?'<span class="bracket">[</span>':'<div class="bracket">[</div>',o+='<div class="wrap">',e.forEach((function(e,n){o+='\n                            <div class="array">\n                                '.concat(a(e,!0,n>=r-1,s)).concat(n<r-1?",":"","\n                            </div>")})),o+="</div>",o+='<div class="bracket">]'.concat(i,"</div>")));break;default:o+='<span class="'.concat(l.contentType,'">').concat(d).concat(l.content).concat(d,"</span>")}return o},handleData=function(a){var e=type(a);switch(e){case"boolean":a=a?"true":"false";break;case"null":a="null";break;case"undefined":a="undefined";break;case"symbol":case"function":a=a.toString();break;case"array":case"object":a=stringify(JSON.stringify(a),!1,!0,[],!0)}return{contentType:e,content:a}},countIndex={};sessionStorage.getItem("CONSOLE_COUNT")&&(countIndex=JSON.parse(sessionStorage.getItem("CONSOLE_COUNT")));var timeData={},handleArgs=function(a,e){if(e.length>0&&"string"===type(e[0])){var n=e[0].match(/(%[sdifc])([^%]*)/gm);if(n){var t=e.slice(1),s=[];n.forEach((function(a,e){var n=a.slice(0,2),c=t[e];if(void 0!==c){var o="";switch(n){case"%s":o=String(c)+a.slice(2);break;case"%d":case"%i":o=("number"===type(c)?parseInt(c):"NaN")+a.slice(2);break;case"%f":o=("number"===type(c)?c:"NaN")+a.slice(2);break;case"%c":o='<span style="'.concat(c,'">').concat(a.slice(2),"</span>")}s.push(o)}else s.push(a)})),e=s,t.length>n.length&&(e=e.concat(t.slice(n.length)))}}switch(a){case"assert":e[0]?e=null:(a="error",e=["Assertion failed: "+(e[1]||"console.assert")]);break;case"count":e[0]?(void 0!==countIndex[e[0]]?countIndex[e[0]]++:countIndex[e[0]]=1,sessionStorage.setItem("CONSOLE_COUNT",JSON.stringify(countIndex)),e=[e[0]+": "+countIndex[e[0]]]):e=null;break;case"time":timeData[e[0]]=Date.now(),e=null;break;case"timeEnd":e=timeData[e[0]]?[e[0]+": "+(Date.now()-timeData[e[0]])+" ms"]:null}return{method:a,args:e}};function ProxyConsole(){}["debug","clear","error","info","log","warn","dir","props","group","groupEnd","dirxml","table","trace","assert","count","markTimeline","profile","profileEnd","time","timeEnd","timeStamp","groupCollapsed"].forEach((function(a){var e=console[a];ProxyConsole.prototype[a]=function(){for(var n=arguments.length,t=new Array(n),s=0;s<n;s++)t[s]=arguments[s];var c=handleArgs(a,t);c.args&&window.parent.postMessage({type:"console",method:c.method,data:c.args.map((function(a){return handleData(a)}))}),e.apply(ProxyConsole,t)}})),window.console=new ProxyConsole;var onMessage=function onMessage(_ref){var _ref$data=_ref.data,data=void 0===_ref$data?{}:_ref$data;if("command"===data.type)try{console.log("＞ "+data.data),console.log(eval(data.data))}catch(a){console.error("js执行出错"),console.error(a)}else"log_info"===data.type?console.log(data.data):"log_error"===data.type&&console.error(data.data)};window.addEventListener("message",onMessage)})();