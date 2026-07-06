function e(e,t,a,i){var n,o=arguments.length,r=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,a):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,a,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(r=(o<3?n(r):o>3?n(t,a,r):n(t,a))||r);return o>3&&r&&Object.defineProperty(t,a,r),r}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,a=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let o=class{constructor(e,t,a){if(this._$cssResult$=!0,a!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(a&&void 0===e){const a=void 0!==t&&1===t.length;a&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),a&&n.set(t,e))}return e}toString(){return this.cssText}};const r=(e,...t)=>{const a=1===e.length?e[0]:t.reduce((t,a,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+e[i+1],e[0]);return new o(a,e,i)},s=a?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const a of e.cssRules)t+=a.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:u,getOwnPropertySymbols:m,getPrototypeOf:p}=Object,g=globalThis,_=g.trustedTypes,h=_?_.emptyScript:"",v=g.reactiveElementPolyfillSupport,f=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?h:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let a=e;switch(t){case Boolean:a=null!==e;break;case Number:a=null===e?null:Number(e);break;case Object:case Array:try{a=JSON.parse(e)}catch(e){a=null}}return a}},y=(e,t)=>!l(e,t),k={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=k){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const a=Symbol(),i=this.getPropertyDescriptor(e,a,t);void 0!==i&&c(this.prototype,e,i)}}static getPropertyDescriptor(e,t,a){const{get:i,set:n}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const o=i?.call(this);n?.call(this,t),this.requestUpdate(e,o,a)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??k}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=p(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...u(e),...m(e)];for(const a of t)this.createProperty(a,e[a])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,a]of t)this.elementProperties.set(e,a)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const a=this._$Eu(e,t);void 0!==a&&this._$Eh.set(a,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const a=new Set(e.flat(1/0).reverse());for(const e of a)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static _$Eu(e,t){const a=t.attribute;return!1===a?void 0:"string"==typeof a?a:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const a of t.keys())this.hasOwnProperty(a)&&(e.set(a,this[a]),delete this[a]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(a)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const a of i){const i=document.createElement("style"),n=t.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=a.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,a){this._$AK(e,a)}_$ET(e,t){const a=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,a);if(void 0!==i&&!0===a.reflect){const n=(void 0!==a.converter?.toAttribute?a.converter:b).toAttribute(t,a.type);this._$Em=e,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(e,t){const a=this.constructor,i=a._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=a.getPropertyOptions(i),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=i;const o=n.fromAttribute(t,e.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(e,t,a,i=!1,n){if(void 0!==e){const o=this.constructor;if(!1===i&&(n=this[e]),a??=o.getPropertyOptions(e),!((a.hasChanged??y)(n,t)||a.useDefault&&a.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,a))))return;this.C(e,t,a)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:a,reflect:i,wrapped:n},o){a&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==n||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||a||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,a]of e){const{wrapped:e}=a,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,a,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[f("elementProperties")]=new Map,x[f("finalized")]=new Map,v?.({ReactiveElement:x}),(g.reactiveElementVersions??=[]).push("2.1.2");const z=globalThis,w=e=>e,A=z.trustedTypes,E=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+P,M=`<${C}>`,T=document,R=()=>T.createComment(""),j=e=>null===e||"object"!=typeof e&&"function"!=typeof e,$=Array.isArray,N="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,O=/>/g,D=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),V=/'/g,U=/"/g,K=/^(?:script|style|textarea|title)$/i,F=e=>(t,...a)=>({_$litType$:e,strings:t,values:a}),q=F(1),H=F(2),G=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),Z=new WeakMap,Y=T.createTreeWalker(T,129);function X(e,t){if(!$(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(t):t}const W=(e,t)=>{const a=e.length-1,i=[];let n,o=2===t?"<svg>":3===t?"<math>":"",r=I;for(let t=0;t<a;t++){const a=e[t];let s,l,c=-1,d=0;for(;d<a.length&&(r.lastIndex=d,l=r.exec(a),null!==l);)d=r.lastIndex,r===I?"!--"===l[1]?r=L:void 0!==l[1]?r=O:void 0!==l[2]?(K.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=D):void 0!==l[3]&&(r=D):r===D?">"===l[0]?(r=n??I,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,s=l[1],r=void 0===l[3]?D:'"'===l[3]?U:V):r===U||r===V?r=D:r===L||r===O?r=I:(r=D,n=void 0);const u=r===D&&e[t+1].startsWith("/>")?" ":"";o+=r===I?a+M:c>=0?(i.push(s),a.slice(0,c)+S+a.slice(c)+P+u):a+P+(-2===c?t:u)}return[X(e,o+(e[a]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class J{constructor({strings:e,_$litType$:t},a){let i;this.parts=[];let n=0,o=0;const r=e.length-1,s=this.parts,[l,c]=W(e,t);if(this.el=J.createElement(l,a),Y.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=Y.nextNode())&&s.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(S)){const t=c[o++],a=i.getAttribute(e).split(P),r=/([.?@])?(.*)/.exec(t);s.push({type:1,index:n,name:r[2],strings:a,ctor:"."===r[1]?ie:"?"===r[1]?ne:"@"===r[1]?oe:ae}),i.removeAttribute(e)}else e.startsWith(P)&&(s.push({type:6,index:n}),i.removeAttribute(e));if(K.test(i.tagName)){const e=i.textContent.split(P),t=e.length-1;if(t>0){i.textContent=A?A.emptyScript:"";for(let a=0;a<t;a++)i.append(e[a],R()),Y.nextNode(),s.push({type:2,index:++n});i.append(e[t],R())}}}else if(8===i.nodeType)if(i.data===C)s.push({type:2,index:n});else{let e=-1;for(;-1!==(e=i.data.indexOf(P,e+1));)s.push({type:7,index:n}),e+=P.length-1}n++}}static createElement(e,t){const a=T.createElement("template");return a.innerHTML=e,a}}function Q(e,t,a=e,i){if(t===G)return t;let n=void 0!==i?a._$Co?.[i]:a._$Cl;const o=j(t)?void 0:t._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),void 0===o?n=void 0:(n=new o(e),n._$AT(e,a,i)),void 0!==i?(a._$Co??=[])[i]=n:a._$Cl=n),void 0!==n&&(t=Q(e,n._$AS(e,t.values),n,i)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:a}=this._$AD,i=(e?.creationScope??T).importNode(t,!0);Y.currentNode=i;let n=Y.nextNode(),o=0,r=0,s=a[0];for(;void 0!==s;){if(o===s.index){let t;2===s.type?t=new te(n,n.nextSibling,this,e):1===s.type?t=new s.ctor(n,s.name,s.strings,this,e):6===s.type&&(t=new re(n,this,e)),this._$AV.push(t),s=a[++r]}o!==s?.index&&(n=Y.nextNode(),o++)}return Y.currentNode=T,i}p(e){let t=0;for(const a of this._$AV)void 0!==a&&(void 0!==a.strings?(a._$AI(e,a,t),t+=a.strings.length-2):a._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,a,i){this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=a,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),j(e)?e===B||null==e||""===e?(this._$AH!==B&&this._$AR(),this._$AH=B):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>$(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==B&&j(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:a}=e,i="number"==typeof a?this._$AC(e):(void 0===a.el&&(a.el=J.createElement(X(a.h,a.h[0]),this.options)),a);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new ee(i,this),a=e.u(this.options);e.p(t),this.T(a),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new J(e)),t}k(e){$(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let a,i=0;for(const n of e)i===t.length?t.push(a=new te(this.O(R()),this.O(R()),this,this.options)):a=t[i],a._$AI(n),i++;i<t.length&&(this._$AR(a&&a._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=w(e).nextSibling;w(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ae{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,a,i,n){this.type=1,this._$AH=B,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=n,a.length>2||""!==a[0]||""!==a[1]?(this._$AH=Array(a.length-1).fill(new String),this.strings=a):this._$AH=B}_$AI(e,t=this,a,i){const n=this.strings;let o=!1;if(void 0===n)e=Q(this,e,t,0),o=!j(e)||e!==this._$AH&&e!==G,o&&(this._$AH=e);else{const i=e;let r,s;for(e=n[0],r=0;r<n.length-1;r++)s=Q(this,i[a+r],t,r),s===G&&(s=this._$AH[r]),o||=!j(s)||s!==this._$AH[r],s===B?e=B:e!==B&&(e+=(s??"")+n[r+1]),this._$AH[r]=s}o&&!i&&this.j(e)}j(e){e===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends ae{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===B?void 0:e}}class ne extends ae{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==B)}}class oe extends ae{constructor(e,t,a,i,n){super(e,t,a,i,n),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??B)===G)return;const a=this._$AH,i=e===B&&a!==B||e.capture!==a.capture||e.once!==a.once||e.passive!==a.passive,n=e!==B&&(a===B||i);i&&this.element.removeEventListener(this.name,this,a),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,a){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=a}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const se=z.litHtmlPolyfillSupport;se?.(J,te),(z.litHtmlVersions??=[]).push("3.3.3");const le=globalThis;class ce extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,a)=>{const i=a?.renderBefore??t;let n=i._$litPart$;if(void 0===n){const e=a?.renderBefore??null;i._$litPart$=n=new te(t.insertBefore(R(),e),e,void 0,a??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const ue=e=>(t,a)=>{void 0!==a?a.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},me={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:y},pe=(e=me,t,a)=>{const{kind:i,metadata:n}=a;let o=globalThis.litPropertyMetadata.get(n);if(void 0===o&&globalThis.litPropertyMetadata.set(n,o=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),o.set(a.name,e),"accessor"===i){const{name:i}=a;return{set(a){const n=t.get.call(this);t.set.call(this,a),this.requestUpdate(i,n,e,!0,a)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=a;return function(a){const n=this[i];t.call(this,a),this.requestUpdate(i,n,e,!0,a)}}throw Error("Unsupported decorator location: "+i)};function ge(e){return(t,a)=>"object"==typeof a?pe(e,t,a):((e,t,a)=>{const i=t.hasOwnProperty(a);return t.constructor.createProperty(a,e),i?Object.getOwnPropertyDescriptor(t,a):void 0})(e,t,a)}function _e(e){return ge({...e,state:!0,attribute:!1})}var he,ve;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(he||(he={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(ve||(ve={}));const fe=(e,t,a,i={})=>{const n=new CustomEvent(t,{bubbles:i.bubbles??!0,cancelable:!!i.cancelable,composed:i.composed??!0,detail:a});return e.dispatchEvent(n),n},be=e=>{fe(window,"haptic",e)};var ye={version:"Версия",invalid_configuration:"Невалидна конфигурация {0}",description:"Контролирайте робота си от карта",old_configuration:"Намерена е стара конфигурация. Променете конфигурацията с последните промени или започнете с нова карта.",old_configuration_migration_link:"Инструкции за миграция"},ke={invalid:"Невалиден шаблон!",vacuum_goto:"Точка & старт",vacuum_goto_predefined:"Точки",vacuum_clean_segment:"Стаи",vacuum_clean_point:"Почистване на точка",vacuum_clean_point_predefined:"Точки",vacuum_clean_zone:"Почистване на зона",vacuum_clean_zone_predefined:"Списък зони",vacuum_follow_path:"Път"},xe={preset:{entity:{missing:"Липсващо свойство: entity"},preset_name:{missing:"Липсващо свойство: preset_name"},platform:{invalid:"Невалидна платформа (vacuum platform): {0}"},map_source:{missing:"Липсващо свойство: map_source",none_provided:"Не е предоставена камера или снимка",ambiguous:"Позволен е само един източник на карта"},calibration_source:{missing:"Липсващо свойство: calibration_source",ambiguous:"Позволен е само един източник на калибриране",none_provided:"Не е намерен източник на калибриране",calibration_points:{invalid_number:"Необходими са точно 3 или 4 източника на калибриране",missing_map:"Всяка точка за калибриране трябва да притежава координати от картата",missing_vacuum:"Всяка точка за калибриране трябва да притежава координати от робота",missing_coordinate:"Точките за калибриране на карта и робот трябва да имат x и y координата"}},icons:{invalid:"Грешка в конфигурацията: icons",icon:{missing:"Всеки запис от лист icons трябва да има свойство icon"}},tiles:{invalid:"Грешка в конфигурацията: tiles",entity:{missing:"Всеки запис от лист tiles трябва да има свойство entity или internal variable"},label:{missing:"Всеки запис от лист tiles трябва да има свойство label"}},map_modes:{invalid:"Грешка в конфигурацията: map_modes",icon:{missing:"Липсва икона за map mode"},name:{missing:"Липсва name за map mode"},template:{invalid:"Невалиден шаблон: {0}"},predefined_selections:{not_applicable:"Режим {0} не подържа предварително зададени селекции",zones:{missing:"Липсва конфигурация за зони",invalid_parameters_number:"Всяка зона трябва да има 4 параметъра"},points:{position:{missing:"Липсва конфигурация за точки",invalid_parameters_number:"Всяка точка трябва да има 2 параметъра"}},rooms:{id:{missing:"Липсва id на стая",invalid_format:"Невалидно room id: {0}"},outline:{invalid_parameters_number:"Всяка точка от контура на стаята трябва да има 2 параметъра"}},label:{x:{missing:"Label трябва да има свойство x"},y:{missing:"Label трябва да има свойство y"},text:{missing:"Label трябва да има свойство text"}},icon:{x:{missing:"Icon трябва да има свойство x"},y:{missing:"Icon трябва да има свойство y"},name:{missing:"Icon трябва да има свойство name"}}},service_call_schema:{missing:"Липсва схема за service call",service:{missing:"Service call трябва да съдържа service",invalid:"Невалиден service: {0}"}}}},invalid_entities:"Невалидни обекти:",invalid_calibration:"Невалидно калибриране, проверете конфигурацията"},ze={status:{label:"Статус",value:{starting:"Стартиране","charger disconnected":"Изключен от зарядно",idle:"Неактивен","remote control active":"Дистанционното управление е активно",cleaning:"Почистване","returning home":"Прибиране","manual mode":"Ръчен режим",charging:"Зареждане","charging problem":"Проблем със зареждане",paused:"Прекъснат","spot cleaning":"Почистване на точка",error:"Грешка","shutting down":"Изключване",updating:"В процес на ъпдейт",docking:"Прибиране","going to target":"Отиване до цел","zoned cleaning":"Зоново почистване","segment cleaning":"Почистване на стая","emptying the bin":"Изпразване на кош","charging complete":"Зареждането приключи","device offline":"Устройство неактивно"}},battery_level:{label:"Батерия"},fan_speed:{label:"Режим",value:{silent:"Тих",standard:"Стандартен",medium:"Среден",turbo:"Turbo",auto:"Автоматичен",gentle:"Нежен"}},sensor_dirty_left:{label:"Оставащ живот на сензор"},filter_left:{label:"Оставащ живот на филтър"},main_brush_left:{label:"Оставащ живот на основна четка"},side_brush_left:{label:"Оставащ живот на странична четка"},cleaning_count:{label:"Брой почиствания"},cleaned_area:{label:"Почистена площ"},total_cleaned_area:{label:"Общо почистена площ"},cleaning_time:{label:"Време за почистване"},total_cleaning_time:{label:"Общо време за почистване"},mop_left:{label:"Оставащ живот на парцал"},bin_full:{label:"Пълен кош",value:{true:"Да",false:"Не"}},bin_present:{label:"Кош наличен",value:{true:"Да",false:"Не"}},water_volume:{label:"Количество вода"},mop_pad_humidity:{label:"Подложка с парцал"}},we={vacuum_start:"Старт",vacuum_pause:"Пауза",vacuum_stop:"Стоп",vacuum_return_to_base:"Връшане",vacuum_clean_spot:"Изчистване на точка",vacuum_locate:"Намиране",vacuum_set_fan_speed:"Проняна на скоростта"},Ae={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Ee={success:"Успех!",no_selection:"Не е предоставена селекция",failed:"Неуспех при повикване на service"},Se={description:{text:"Този визуален редактор поддържа само основна конфигурация. За подробни настройки използвайте режима YAML."},label:{name:"Заглавие (по избор)",entity:"Vacuum обект (задължително)",camera:"Camera обект (задължително)",vacuum_platform:"Vacuum платформа (задължително)",map_locked:"Заключване на карта (по избор)",two_finger_pan:"Навигация с два пръста (по избор)",map_only:"Map only (optional)",platforms_documentation:"Документация за избраната платформа ({0})",selection:"Селекция:",copy:"Копиране",copied:"Копирано!",set_static_config:"Генериране на статична конфигурация",config_set:"Конфигурирано!\nОтворете редактора на конфигурация за промяна.",config_set_failed:"Грешка при създаване на конфигурация.",generate_rooms_config:"Генериране на конфигурация за стаи",copy_service_call:"Копиране на service call"},alerts:{set_static_config:"Използвайте тази функция асмо ако искате ръчно да промените автоматично генерираната конфигурация.\nНапред?"}},Pe={common:ye,map_mode:ke,validation:xe,tile:ze,icon:we,unit:Ae,popups:Ee,editor:Se},Ce=Object.freeze({__proto__:null,common:ye,default:Pe,editor:Se,icon:we,map_mode:ke,popups:Ee,tile:ze,unit:Ae,validation:xe}),Me={version:"Versió",invalid_configuration:"Configuració no vàlida {0}",description:"Una targeta que et permet controlar l'aspiradora",old_configuration:"S'ha detectat una configuració antiga. Ajusta la teva configuració a l'últim esquema o crea una nova targeta des de zero.",old_configuration_migration_link:"Guia de migrat"},Te={invalid:"Plantilla no vàlida!",vacuum_goto:"Marcar i anar",vacuum_goto_predefined:"Punts",vacuum_clean_segment:"Habitacions",vacuum_clean_point:"Netejar punt",vacuum_clean_point_predefined:"Punts",vacuum_clean_zone:"Netejar zona",vacuum_clean_zone_predefined:"Llista de zones",vacuum_follow_path:"Camí"},Re={preset:{entity:{missing:"Propietat no trobada: entity"},preset_name:{missing:"Propietat no trobada: preset_name"},platform:{invalid:"Plataforma d'aspiradora no vàlida: {0}"},map_source:{missing:"Propietat no trobada: map_source",none_provided:"Cap càmera ni imatge proporcionada",ambiguous:"Només es permet una font de mapa"},calibration_source:{missing:"Propietat no trobada: calibration_source",ambiguous:"Només es permet una font de calibratge",none_provided:"No s'ha proporcionat cap font de calibratge",calibration_points:{invalid_number:"Es requereixen exactament 3 o 4 punts de calibratge",missing_map:"Cada punt de calibratge ha de contenir coordenades del mapa",missing_vacuum:"Cada punt de calibratge ha de contenir les coordenades de l'aspiradora",missing_coordinate:"Els punts de calibratge de l'aspiradora i del mapa han de contenir les coordenades x i y"}},icons:{invalid:"Error a la configuració: icons",icon:{missing:"Cada entrada de la llista d'icones ha de contenir la propietat de la icona"}},tiles:{invalid:"Error a la configuració: tiles",entity:{missing:"Cada entrada de la llista de mosaics ha de contenir l'entitat o la variable interna"},label:{missing:"Cada entrada de la llista de mosaics ha de contenir una etiqueta"}},map_modes:{invalid:"Error a la configuració: map_modes",icon:{missing:"Falta la icona del mode de mapa"},name:{missing:"Manca el nom del mode de mapa"},template:{invalid:"Plantilla no vàlida: {0}"},predefined_selections:{not_applicable:"El mode {0} no admet seleccions predefinides",zones:{missing:"Manquen configuracions de zones",invalid_parameters_number:"Cada zona ha de tenir 4 paràmetres"},points:{position:{missing:"Manquen configuracions de punts",invalid_parameters_number:"Cada punt ha de tenir 2 paràmetres"}},rooms:{id:{missing:"Falta l'identificador de l'habitació",invalid_format:"Identificador de l'habitació no vàlid: {0}"},outline:{invalid_parameters_number:"Cada punt del contorn de l'habitació ha de tenir 2 paràmetres"}},label:{x:{missing:"L'etiqueta ha de tenir la propietat x"},y:{missing:"L'etiqueta ha de tenir la propietat y"},text:{missing:"L'etiqueta ha de tenir propietat text"}},icon:{x:{missing:"La icona ha de tenir la propietat x"},y:{missing:"La icona ha de tenir la propietat y"},name:{missing:"La icona ha de tenir una propietat name"}}},service_call_schema:{missing:"Falta l'esquema de trucada de servei",service:{missing:"L'esquema de trucada de servei ha de contenir service",invalid:"Servei no vàlid: {0}"}}}},invalid_entities:"Entitats no vàlides:",invalid_calibration:"Calibració no vàlida, comproveu la vostra configuració"},je={status:{label:"Estat",value:{starting:"Començant","charger disconnected":"Carregador desconnectat",idle:"Inactiu","remote control active":"Comandament a distància actiu",cleaning:"Netejant","returning home":"Tornant a casa","manual mode":"Mode manual",charging:"Carregant","charging problem":"Problema de càrrega",paused:"En pausa","spot cleaning":"Neteja per punts",error:"Error","shutting down":"Apagant",updating:"Actualitzant",docking:"Acoblament","going to target":"Anant a l'objectiu","zoned cleaning":"Neteja per zones","segment cleaning":"Neteja per segments","emptying the bin":"Buidant el dipòsit","charging complete":"Càrrega completa","device offline":"Dispositiu desconnectat"}},battery_level:{label:"Bateria"},fan_speed:{label:"Velocitat del ventilador",value:{silent:"Silenciós",standard:"Normal",medium:"Mitjà",turbo:"Turbo",auto:"Automàtic",gentle:"Suau"}},sensor_dirty_left:{label:"Sensors"},filter_left:{label:"Filtre"},main_brush_left:{label:"Raspall principal"},side_brush_left:{label:"Raspall lateral"},cleaning_count:{label:"Recompte de neteja"},cleaned_area:{label:"Zona netejada"},cleaning_time:{label:"Temps de neteja"},mop_left:{label:"Fregona"},bin_full:{label:"Dipòsit ple",value:{true:"Sí",false:"No"}},bin_present:{label:"Dipòsit introduït",value:{true:"Sí",false:"No"}}},$e={vacuum_start:"Començar",vacuum_pause:"Pausa",vacuum_stop:"Atura",vacuum_return_to_base:"Tornar a la base",vacuum_clean_spot:"Netejar punt",vacuum_locate:"Localitzar",vacuum_set_fan_speed:"Canvia la velocitat del ventilador"},Ne={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Ie={success:"Fet!",no_selection:"No s'ha proporcionat cap selecció",failed:"No s'ha pogut trucar al servei"},Le={description:{text:"Aquest editor visual només admet una configuració bàsica. Per a una configuració més avançada, utilitzeu el mode YAML."},label:{name:"Títol (opcional)",entity:"Entitat de l'aspiradora (obligatori)",camera:"Entitat de la càmera (obligatori)",vacuum_platform:"Plataforma de la aspiradora (obligatori)",map_locked:"Mapa bloquejat(opcional)",two_finger_pan:"Moure amb dos dits (opcional)",map_only:"Map only (optional)",platforms_documentation:"Documentació de la plataforma seleccionadan ({0})",selection:"Selecció:",copy:"Copiar",copied:"Copiat!",set_static_config:"Genera una configuració estàtica",config_set:"Configuració realitzada!\nObriu l'editor de configuració per ajustar-lo.",config_set_failed:"No s'ha pogut actualitzar la configuració.",generate_rooms_config:"Genera la configuració de les habitacions",copy_service_call:"Trucada de servei de còpia"}},Oe={common:Me,map_mode:Te,validation:Re,tile:je,icon:$e,unit:Ne,popups:Ie,editor:Le},De=Object.freeze({__proto__:null,common:Me,default:Oe,editor:Le,icon:$e,map_mode:Te,popups:Ie,tile:je,unit:Ne,validation:Re}),Ve={version:"Verze",invalid_configuration:"Neplatná konfigurace {0}",description:"Karta pomocí které můžete ovládat váš vysavač",old_configuration:"Detekována zastaralá konfigurace. Upravte prosím konfiguraci nebo kartu vytvořte znovu od začátku.",old_configuration_migration_link:"Návod na úpravu konfigurace"},Ue={invalid:"Neplatná šablona",vacuum_goto:"Přesun na bod",vacuum_goto_predefined:"Přesun na bod ze seznamu",vacuum_clean_segment:"Úklid místnosti",vacuum_clean_point:"Úklid bodu",vacuum_clean_point_predefined:"Úklid bodu ze seznamu",vacuum_clean_zone:"Úklid oblasti",vacuum_clean_zone_predefined:"Úklid oblasti ze seznamu",vacuum_follow_path:"Trasa"},Ke={preset:{entity:{missing:'Chybějící položka "entity"'},preset_name:{missing:'Chybějící položka "preset_name"'},platform:{invalid:"Neplatná platforma vysavače: {0}"},map_source:{missing:'Chybějící položka "map_source"',none_provided:"Chybějící odkaz na kameru nebo obrázek s mapou",ambiguous:"Povolen pouze jeden zdroj mapy"},calibration_source:{missing:'Chybějící položka "calibration_source"',ambiguous:"Povolen pouze jeden zdroj kalibrace",none_provided:"Chybějící zdroj kalibrace",calibration_points:{invalid_number:"Požadovány 3 nebo 4 kalibrační body",missing_map:"Každý kalibrační bod musí obsahovat souřadnice mapy",missing_vacuum:"Každý kalibrační bod musí obsahovat souřadnice vysavače",missing_coordinate:'Souřadnice mapy i vysavače musí vždy obsahovat položku "x" a "y"'}},icons:{invalid:'Neplatná konfigurace pro položku "icons"',icon:{missing:'Každý záznam v seznamu ikon musí vždy obsahovat položku "icon"'}},tiles:{invalid:'Neplatná konfigurace pro položku "tiles"',entity:{missing:'Každý záznam v seznamu dlaždic musí vždy obsahovat položku "entity"'},label:{missing:'Každý záznam v seznamu dlaždic musí vždy obsahovat položku "label"'}},map_modes:{invalid:'Neplatná konfigurace pro položku "map_modes"',icon:{missing:"Chybějící ikona pro mapový režim"},name:{missing:"Chybějící název pro mapový režim"},template:{invalid:"Neplatná šablona: {0}"},predefined_selections:{not_applicable:"Režim {0} nepodporuje výběr z přednastavených možností",zones:{missing:"Chybějící konfigurace oblastí",invalid_parameters_number:"Každá oblast musí mít 4 parametry"},points:{position:{missing:"Chybějící konfigurace bodů",invalid_parameters_number:"Každý bod musí mít 2 parametry"}},rooms:{id:{missing:"Chybějící identifikátor místnosti",invalid_format:"Neplatný identifikátor místnosti: {0}"},outline:{invalid_parameters_number:"Každý bod ohraničení místnosti musí mít 2 parametry"}},label:{x:{missing:'Popisek musí mít položku "x"'},y:{missing:'Popisek musí mít položku "y"'},text:{missing:'Popisek musí mít položku "text"'}},icon:{x:{missing:'Ikona musí mít položku "x"'},y:{missing:'Ikona musí mít položku "y"'},name:{missing:'Ikona musí mít položku "name"'}}},service_call_schema:{missing:"Chybějící formát volání služby",service:{missing:'Formát volání služby musí obsahovat položku "service"',invalid:"Neplatná služba: {0}"}}}},invalid_entities:"Neplatné entity:",invalid_calibration:"Neplatná kalibrace, prosím zkontrolujte konfiguraci"},Fe={status:{label:"Stav",value:{starting:"Zapínání","charger disconnected":"Nabíječka odpojena",idle:"Nečinný","remote control active":"Dálkové ovládání aktivní",cleaning:"Uklízení","returning home":"Návrat do základny","manual mode":"Manuální režim",charging:"Nabíjení","charging problem":"Problém s nabíjením",paused:"Pozastaven","spot cleaning":"Uklízení bodu",error:"Chyba","shutting down":"Vypínání",updating:"Probíhá aktualizace",docking:"Parkování","going to target":"Přesun na bod","zoned cleaning":"Uklízení oblasti","segment cleaning":"Uklízení místnosti","emptying the bin":"Vyprazdňování zásobníku","charging complete":"Nabíjení dokončeno","device offline":"Zařízení je nedostupné"}},battery_level:{label:"Baterie"},fan_speed:{label:"Stupeň vysávání",value:{silent:"Tichý",standard:"Standardní",medium:"Střední",turbo:"Turbo",auto:"Automatický",gentle:"Slabý"}},sensor_dirty_left:{label:"Čistota senzorů"},filter_left:{label:"Životnost filtru"},main_brush_left:{label:"Životnost hlavního kartáče"},side_brush_left:{label:"Životnost bočních kartáčů"},cleaning_count:{label:"Počet úklidů"},cleaned_area:{label:"Uklizená plocha"},total_cleaned_area:{label:"Celková uklizená plocha"},cleaning_time:{label:"Doba uklízení"},total_cleaning_time:{label:"Celková doba uklízení"},mop_left:{label:"Životnost mopu"},bin_full:{label:"Odpadní nádoba plná",value:{true:"Ano",false:"Ne"}},bin_present:{label:"Odpadní nádoba vložena",value:{true:"Ano",false:"Ne"}},water_volume:{label:"Množství vody"},mop_pad_humidity:{label:"Vlhkost mopu"}},qe={vacuum_start:"Zahájit úklid",vacuum_pause:"Pozastavit úklid",vacuum_stop:"Ukončit úklid",vacuum_return_to_base:"Návrat do základny",vacuum_clean_spot:"Uklidit bod",vacuum_locate:"Najít",vacuum_set_fan_speed:"Nastavit stupeň sání"},He={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Ge={success:"Volání služby bylo úspěšné",no_selection:"Nebyl proveden žádný výběr",failed:"Volání služby selhalo"},Be={description:{text:"Tento editor podporuje pouze základní konfiguraci. Pro pokročilá nastavení použijte editor kódu."},label:{name:"Titulek (volitelná položka)",entity:"Entita vysavače (povinná položka)",camera:"Entita kamery (povinná položka)",vacuum_platform:"Platforma vysavače (povinná položka)",map_locked:"Uzamčení mapy",two_finger_pan:"Posuv mapy dvěma prsty",map_only:"Map only (optional)",platforms_documentation:"Dokumentace vybrané platformy ({0})",selection:"Výběr:",copy:"Kopírovat",copied:"Zkopírováno!",set_static_config:"Generovat statickou konfiguraci",config_set:"Konfigurace nastavena!\nPro úpravu otevři editor kódu.",config_set_failed:"Aktualizace nastavení selhala.",generate_rooms_config:"Generovat konfiguraci místností",copy_service_call:"Kopírovat volání služby"},alerts:{set_static_config:"Toto nastavení se používá pouze pokud chcete manuálně upravit automaticky generovanou konfiguraci. \nPokračovat?"}},Ze={common:Ve,map_mode:Ue,validation:Ke,tile:Fe,icon:qe,unit:He,popups:Ge,editor:Be},Ye=Object.freeze({__proto__:null,common:Ve,default:Ze,editor:Be,icon:qe,map_mode:Ue,popups:Ge,tile:Fe,unit:He,validation:Ke}),Xe={version:"Version",invalid_configuration:"Ugyldig konfiguration {0}",description:"Et kort som lader dig styre din robotstøvsuger",old_configuration:"Gammel opsætning fundet. Juster dine indstillinger til det seneste format, eller lav et nyt kort fra bunden.",old_configuration_migration_link:"Migrerings vejledning"},We={invalid:"Ugyldigt template!",vacuum_goto:"Klik & Gå",vacuum_goto_predefined:"Punkter",vacuum_clean_segment:"Rum",vacuum_clean_zone:"Zone rengøring",vacuum_clean_zone_predefined:"Zoner",vacuum_follow_path:"Sti"},Je={preset:{entity:{missing:"Mangler indstilling: entity"},preset_name:{missing:"Mangler indstilling: preset_name"},platform:{invalid:"Ugyldig støvsuger platform: {0}"},map_source:{missing:"Mangler indstilling: map_source",none_provided:"Intet kamera eller billede er angivet",ambiguous:"Kun en kort-kilde tilladt"},calibration_source:{missing:"Mangler indstilling: calibration_source",ambiguous:"Kun en kalibrerings-kilde tilladt",none_provided:"Ingen kalibrerings kilde angivet",calibration_points:{invalid_number:"Nøjagtigt 3 eller 4 kalibreringspunkter påkrævet",missing_map:"Alle kalibreringspunkter skal indeholde kort koordinater",missing_vacuum:"Alle kalibreringspunkter skal indeholde støvsuger koordinater",missing_coordinate:"Kort og støvsugers kalibreringspunkter skal indeholde både x og y koordinater"}},icons:{invalid:"Fejl i konfiguration: icons",icon:{missing:"Alle punkter i icons listen skal indeholde icon egenskaben"}},tiles:{invalid:"Fejl i konfiguration: tiles",entity:{missing_outdated_translation:"Alle punkter i tiles listen skal indehold entity egenskaben"},label:{missing:"Alle punkter i tiles listen skal indehold label egenskaben"}},map_modes:{invalid:"Fejl i konfiguration: map_modes",icon:{missing:"Ikon mangler"},name:{missing:"Navn mangler"},template:{invalid:"Ugyldigt template: {0}"},predefined_selections:{not_applicable:"Mode {0} understøtter ikke predefinerede valg",zones:{missing:"Zone konfiguration mangler",invalid_parameters_number:"En zone skal indeholde 4 parametre."},points:{position:{missing:"Punkt konfiguration mangler",invalid_parameters_number:"Et punkt skal indeholde 2 parametre"}},rooms:{id:{missing:"Rummets id mangler",invalid_format:"Ugyldigt rum id: {0}"},outline:{invalid_parameters_number:"Et punkt i rummets kant skal indeholde 2 parametre"}},label:{x:{missing:"Label skal indeholde egenskaben x"},y:{missing:"Label skal indeholde egenskaben y"},text:{missing:"Label skal indeholde egenskaben text"}},icon:{x:{missing:"Icon skal indeholde egenskaben x"},y:{missing:"Icon skal indeholde egenskaben y"},name:{missing:"Icon skal indeholde egenskaben name"}}},service_call_schema:{missing:"Service-kald indstillingerne mangler",service:{missing:"Service-kald indstillinger skal indeholde en service",invalid:"Ugyldig service: {0}"}}}},invalid_entities:"Ugyldige entiteter:",invalid_calibration:"Ugyldig kalibrering, du bedes gennemgå din konfiguration"},Qe={status:{label:"Status",value:{starting:"Starter","charger disconnected":"Oplader koblet fra",idle:"Ledig","remote control active":"Fjernstyring aktivt",cleaning:"Rengører","returning home":"Vender hjem","manual mode":"Manuel tilstand",charging:"Oplader","charging problem":"Opladnings-problem",paused:"Sat på pause","spot cleaning":"Spot rengøring",error:"Fejl","shutting down":"Slukker",updating:"Opdaterer",docking:"Docker","going to target":"Går til mål","zoned cleaning":"Zone rengøring","segment cleaning":"Segment rengøring","emptying the bin":"Tømmes","charging complete":"Fuldt opladt","device offline":"Enhed offline"}},battery_level:{label:"Batteri"},fan_speed:{label:"Hastighed",value:{silent:"Stille",standard:"Standard",medium:"Medium",turbo:"Turbo",auto:"Auto",gentle:"Mild"}},sensor_dirty_left:{label:"Sensor vedl."},filter_left:{label:"Filter vedl."},main_brush_left:{label:"Hovedbørste vedl."},side_brush_left:{label:"Sidebørste vedl."},cleaning_count:{label:"Rengøringstæller"},cleaned_area:{label:"Rengjort areal"},cleaning_time:{label:"Rengørings tid"}},et={vacuum_start:"Start",vacuum_pause:"Pause",vacuum_stop:"Stop",vacuum_return_to_base:"Returner",vacuum_clean_spot:"Spotrengør",vacuum_locate:"Find",vacuum_set_fan_speed:"Skift hastighed"},tt={hour_shortcut:"t",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},at={success:"Succes!",no_selection:"Intet valg angivet",failed:"Service-kald fejlede"},it={description:{text:"Den visuelle editor understøtter kun en grundlæggende konfiguration. For en mere advanceret konfiguration, brug YAML mode."},label:{name:"Titel (valgfrit)",entity:"Støvsuger entitet (påkrævet)",camera:"Kamera entitet (påkrævet)",vacuum_platform:"Støvsuger platform (påkrævet)",map_locked:"Kort låst (valgfrit)",two_finger_pan:"To-finger panorering (valgfrit)",map_only:"Map only (optional)"}},nt={common:Xe,map_mode:We,validation:Je,tile:Qe,icon:et,unit:tt,popups:at,editor:it},ot=Object.freeze({__proto__:null,common:Xe,default:nt,editor:it,icon:et,map_mode:We,popups:at,tile:Qe,unit:tt,validation:Je}),rt={version:"Version",invalid_configuration:"Ungültige Konfiguration {0}",description:"Eine Karte, mit der Sie Ihren Staubsauger kontrollieren können.",old_configuration:"Es wurde eine alte Konfiguration erkannt. Passen Sie Ihre Konfiguration an das neueste Schema an oder erstellen Sie eine neue Karte von Grund auf.",old_configuration_migration_link:"Migrationsanleitung"},st={invalid:"Ungültige Vorlage!",vacuum_goto:"Pin & Go",vacuum_goto_predefined:"Punkte",vacuum_clean_segment:"Räume",vacuum_clean_point:"Reinige Punkte",vacuum_clean_point_predefined:"Punkte",vacuum_clean_zone:"Zone reinigen",vacuum_clean_zone_predefined:"Zonenliste",vacuum_follow_path:"Pfad"},lt={preset:{entity:{missing:"Fehlende Eigenschaft: entity"},preset_name:{missing:"Fehlende Eigenschaft: preset_name"},platform:{invalid:"Ungültige Staubsauger-Plattform: {0}"},map_source:{missing:"Fehlende Eigenschaft: map_source",none_provided:"Keine Kamera und kein Bild vorhanden",ambiguous:"Nur eine Kartenquelle erlaubt"},calibration_source:{missing:"Fehlende Eigenschaft: calibration_source",ambiguous:"Nur eine Kalibrierungsquelle erlaubt",none_provided:"Keine Kalibrierungsquelle vorhanden",calibration_points:{invalid_number:"Genau 3 oder 4 Kalibrierungspunkte erforderlich",missing_map:"Jeder Kalibrierungspunkt muss Kartenkoordinaten enthalten",missing_vacuum:"Jeder Kalibrierungspunkt muss Stabsauger-Koordinaten enthalten",missing_coordinate:"Karten- und Vakuumkalibrierungspunkte müssen sowohl x- als auch y-Koordinaten enthalten"}},icons:{invalid:"Fehler in der Konfiguration: icons",icon:{missing:"Jeder Eintrag der Icon-Liste muss die Ikoneneigenschaft"}},tiles:{invalid:"Fehler in der Konfiguration: tiles",entity:{missing_outdated_translation:"Jeder Eintrag der Kachel-Liste muss eine Entität enthalten"},label:{missing:"Jeder Eintrag der Kachel-Liste muss ein Label enthalten"}},map_modes:{invalid:"Fehler in der Konfiguration: map_modes",icon:{missing:"Fehlendes Symbol für den Kartenmodus"},name:{missing:"Fehlender Name für den Kartenmodus"},template:{invalid:"Ungültige Vorlage: {0}"},predefined_selections:{not_applicable:"Modus {0} unterstützt keine vordefinierte Auswahl",zones:{missing:"Fehlende Zonenkonfiguration",invalid_parameters_number:"Jede Zone muss 4 Parameter haben"},points:{position:{missing:"Konfiguration der fehlenden Punkte",invalid_parameters_number:"Jeder Punkt muss 2 Parameter haben"}},rooms:{id:{missing:"Fehlende Raum ID",invalid_format:"Ungültige Raum ID: {0}"},outline:{invalid_parameters_number:"Jeder Punkt des Raumes muss 2 Parameter haben."}},label:{x:{missing:"Das Label muss die Eigenschaft x haben"},y:{missing:"Das Label muss die Eigenschaft y haben"},text:{missing:"Das Label muss eine Text-Eigenschaft haben"}},icon:{x:{missing:"Das Icon muss die Eigenschaft x haben"},y:{missing:"Das Icon muss die Eigenschaft y haben"},name:{missing:"Das Icon muss eine Text-Eigenschaft haben"}}},service_call_schema:{missing:"Fehlendes Schema des Service-Aufrufs",service:{missing:"Schema des Service-Aufrufs muss Dienst enthalten",invalid:"Ungültiger Service: {0}"}}}},invalid_entities:"Ungültige Entitäten:",invalid_calibration:"Ungültige Kalibrierung, bitte überprüfen Sie Ihre Konfiguration"},ct={status:{label:"Status",value:{starting:"Starte","charger disconnected":"Ladegerät getrennt",idle:"Inaktiv","remote control active":"Fernsteuerung aktiv",cleaning:"Säubern","returning home":"Kehre zur Ladestation zurück","manual mode":"Manueller Modus",charging:"Lade","charging problem":"Lade-Problem",paused:"Pause","spot cleaning":"Spot-Reinigung",error:"Fehler",sleeping:"Schlafend","shutting down":"Herunterfahren",updating:"Aktualisiere",docking:"Andocken","going to target":"Fahre zum Ziel","zoned cleaning":"Zonen-Reinigung","segment cleaning":"Segment-Reinigung","emptying the bin":"Leere den Staubbehälter","charging complete":"Ladung vollständig","device offline":"Gerät offline"}},battery_level:{label:"Batterie"},fan_speed:{label:"Lüftergeschwindigkeit",value:{silent:"Leise",standard:"Standard",medium:"Medium",turbo:"Turbo",auto:"Auto",gentle:"Sanft",strong:"Stark"}},sensor_dirty_left:{label:"Sensoren verbleibend"},filter_left:{label:"Filter verbleibend"},main_brush_left:{label:"Hauptbürste verbleibend"},side_brush_left:{label:"Seitenbürste verbleibend"},cleaning_count:{label:"Anzahl der Reinigungen"},cleaned_area:{label:"Gereinigte Fläche"},total_cleaned_area:{label:"Gesamte gereinigte Fläche"},cleaning_time:{label:"Zeit der Reinigung"},total_cleaning_time:{label:"Gesamte Reinigungszeit"},mop_left:{label:"Wischblatt verbleibend"},bin_full:{label:"Behälter voll",value:{true:"Ja",false:"Nein"}},bin_present:{label:"Behälter vorhanden",value:{true:"Ja",false:"Nein"}},water_volume:{label:"Wasservolumen"},mop_pad_humidity:{label:"Wischblatt"}},dt={vacuum_start:"Start",vacuum_pause:"Pause",vacuum_stop:"Stop",vacuum_return_to_base:"Rückkehr zur Basis",vacuum_clean_spot:"Reinige Stelle",vacuum_locate:"Finden",vacuum_set_fan_speed:"Lüftergeschwindigkeit ändern"},ut={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},mt={success:"Erfolg!",no_selection:"Keine Auswahl vorgesehen",failed:"Der Dienst konnte nicht aufgerufen werden"},pt={description:{text:"Dieser visuelle Editor unterstützt nur eine einfache Konfiguration. Für erweiterte Einstellungen verwenden Sie den YAML-Modus."},label:{name:"Titel (optional)",entity:"Staubsauger Entität (required)",camera:"Kamera Entität (required)",vacuum_platform:"Staubsauger-Plattform (required)",map_locked:"Karte gesperrt (optional)",two_finger_pan:"Zwei-Finger-Pan (optional)",map_only:"Map only (optional)",platforms_documentation:"Ausgewählte Plattform Dokumentation ({0})",selection:"Auswahl:",copy:"Kopieren",copied:"Kopiert!",set_static_config:"Erstelle statische Konfiguration",config_set:"Konfiguration abgespeichert!\nÖffne Konfigurationseditor zum Ändern.",config_set_failed:"Update der Konfiguration fehlgeschlagen.",generate_rooms_config:"Erstelle Raumkonfiguration",copy_service_call:"Kopiere Service-Aufruf"},alerts:{set_static_config:"Die Funktion nur nutzen, um manuell die automatische erstellte Konfiguration zu ändern.\nWeiter?"}},gt={common:rt,map_mode:st,validation:lt,tile:ct,icon:dt,unit:ut,popups:mt,editor:pt},_t=Object.freeze({__proto__:null,common:rt,default:gt,editor:pt,icon:dt,map_mode:st,popups:mt,tile:ct,unit:ut,validation:lt}),ht={version:"Έκδοση",invalid_configuration:"Μη αποδεκτές ρυθμίσεις {0}",description:"Μία κάρτα που σας επιτρέπει να ελέγξετε την σκούπα σας",old_configuration:"Ανιχνεύθυκαν παλιές ρυθμίσεις. Προσαρμόστε τις ρυθμίσεις σας στο πιο πρόσφατο μοντέλο ή δημιουργήστε μια νέα κάρτα από την αρχή.",old_configuration_migration_link:"Οδηγός μετατροπής παλιών ρυθμίσεων"},vt={invalid:"Μη αποδεκτό πρότυπο!",vacuum_goto:"Πήγαινε Εδώ",vacuum_goto_predefined:"Σημεία",vacuum_clean_segment:"Δωμάτια",vacuum_clean_point:"Σκούπισμα σε σημείο",vacuum_clean_point_predefined:"Σημεία",vacuum_clean_zone:"Σκούπισμα σε ζώνη",vacuum_clean_zone_predefined:"Λίστα ζωνών καθαρισμού",vacuum_follow_path:"Διαδρομή"},ft={preset:{entity:{missing:"Λείπει η ιδιότητα: entity"},preset_name:{missing:"Λείπει η ιδιότητα: preset_name"},platform:{invalid:"Μη αποδεκτή πλατφόρμα σκούπας: {0}"},map_source:{missing:"Λείπει η ιδιότητα: map_source",none_provided:"Δεν ρυθμίστηκε ούτε κάμερα ούτε εικόνα",ambiguous:"Επιτρέπεται μόνο μία πηγή χάρτη"},calibration_source:{missing:"Λείπει η ιδιότητα: calibration_source",ambiguous:"Επιτρέπεται μόνο μία πηγή βαθμονόμησης",none_provided:"Δεν ρυθμίστηκε πηγή βαθμονόμησης",calibration_points:{invalid_number:"Απαιτούνται ακριβώς 3 ή 4 σημεία βαθμονόμησης",missing_map:"Κάθε σημείο βαθμονόμησης πρέπει να περιέχει συντεταγμένες του χάρτη",missing_vacuum:"Κάθε σημείο βαθμονόμησης πρέπει να περιέχει συντεταγμένες της σκούπας",missing_coordinate:"Τα σημεία βαθμονόμησης του χάρτη και της σκούπας πρέπει να περιέχουν συντεταγμένες x και y"}},icons:{invalid:"Λάθος στις ρυθμίσεις: icons",icon:{missing:"Κάθε εγγραφή icon πρέπει να περιέχει μια ιδιότητα icon"}},tiles:{invalid:"Λάθος στις ρυθμίσεις: tiles",entity:{missing_outdated_translation:"Κάθε εγγραφή tile πρέπει να περιέχει entity"},label:{missing:"Κάθε εγγραφή tile πρέπει να περιέχει label"}},map_modes:{invalid:"Λάθος στις ρυθμίσεις: map_modes",icon:{missing:"Λείπει το εικονίδιο του τρόπου λειτουργίας χάρτη"},name:{missing:"Λείπει το όνομα του τρόπου λειτουργίας χάρτη"},template:{invalid:"Μη αποδεκτό πρότυπο: {0}"},predefined_selections:{not_applicable:"Η λειτουργία {0} δεν υποστηρίζει προκαθορισμένες επιλογές",zones:{missing:"Λείπει η ρύθμιση ζωνών καθαρισμού",invalid_parameters_number:"Κάθε ζώνη καθαρισμού πρέπει να έχει 4 παραμέτρους"},points:{position:{missing:"Λείπει η ρύθμιση σημείων",invalid_parameters_number:"Each point must have 2 parameters"}},rooms:{id:{missing:"Λείπει το αναγνωριστικό του δωματίου",invalid_format:"Λάθος αναγνωριστικό δωματίου: {0}"},outline:{invalid_parameters_number:"Κάθε σημείο του περιγράμματος του δωματίου πρέπει να έχει 2 παραμέτρους"}},label:{x:{missing:"Η ταμπέλα πρέπει να έχει ιδιότητα x"},y:{missing:"Η ταμπέλα πρέπει να έχει ιδιότητα y"},text:{missing:"Η ταμπέλα πρέπει να έχει ιδιότητα κειμένου"}},icon:{x:{missing:"Το εικονίδιο πρέπει να έχει ιδιότητα x"},y:{missing:"Το εικονίδιο πρέπει να έχει ιδιότητα y"},name:{missing:"Το εικονίδιο πρέπει να έχει ιδιότητα ονόματος"}}},service_call_schema:{missing:"Λείπει το μοντέλο κλήσης υπηρεσίας",service:{missing:"Το μοντέλο κλήσης υπηρεσίας πρέπει να εμπεριέχει υπηρεσία",invalid:"Μη έγκυρη υπηρεσία: {0}"}}}},invalid_entities:"Λάθος οντότητες:",invalid_calibration:"Λάθος βαθμονόμηση, παρακαλώ ελέγξτε τις ρυθμίσεις σας"},bt={status:{label:"Κατάσταση",value:{starting:"Γίνεται εκκίνηση","charger disconnected":"Αποσυνδέθηκε από τη φόρτιση",idle:"Σε αδράνεια","remote control active":"Χειροκίνητος έλεγχος ενεργός",cleaning:"Γίνεται καθαρισμός","returning home":"Επιστροφή στη βάση","manual mode":"Χειροκίνητη λειτουργία",charging:"Σε φόρτιση","charging problem":"Πρόβλημα φόρτισης",paused:"Σε παύση","spot cleaning":"Καθαρισμός σημείου",error:"Σφάλμα","shutting down":"Γίνεται τερματισμός",updating:"Γίνεται αναβάθμιση",docking:"Σύνδεση στη βάση","going to target":"Πορεία προς προορισμό","zoned cleaning":"Καθαρισμός ζώνης","segment cleaning":"Καθαρισμός τμήματος","emptying the bin":"Άδειασμα κάδου","charging complete":"Φόρτιση πλήρης","device offline":"Συσκευή εκτός δικτύου"}},battery_level:{label:"Μπαταρία"},fan_speed:{label:"Ταχύτητα ανεμιστήρα",value:{silent:"Αθόρυβο",standard:"Τυπικό",medium:"Μέτριο",turbo:"Τούρμπο",auto:"Αυτόματο",gentle:"Ήπιο"}},sensor_dirty_left:{label:"Συντήρηση αισθητήρων"},filter_left:{label:"Συντήρηση φίλτρου"},main_brush_left:{label:"Συντήρηση κύριας βούρτσας"},side_brush_left:{label:"Συντήρηση πλαϊνής βούρτσας"},cleaning_count:{label:"Αριθμός σκουπισμάτων"},cleaned_area:{label:"Έκταση που καθαρίστηκε"},cleaning_time:{label:"Χρόνος καθαρισμού"},mop_left:{label:"Συντήρηση σφουγγαρίστρας"},bin_full:{label:"Κάδος γεμάτος",value:{true:"Ναι",false:"Όχι"}},bin_present:{label:"Κάδος παρών",value:{true:"Ναι",false:"Όχι"}}},yt={vacuum_start:"Έναρξη",vacuum_pause:"Παύση",vacuum_stop:"Διακοπή",vacuum_return_to_base:"Επιστροφή στη βάση",vacuum_clean_spot:"Καθαρισμός σημείου",vacuum_locate:"Εντοπισμός",vacuum_set_fan_speed:"Αλλαγή ταχύτητας ανεμιστήρα"},kt={hour_shortcut:"ω",meter_shortcut:"μ",meter_squared_shortcut:"τ.μ.",minute_shortcut:"λεπ"},xt={success:"Επιτυχία!",no_selection:"Δεν δόθηκε επιλογή",failed:"Αποτυχία κλήσης υπηρεσίας"},zt={description:{text:"Αυτό η οπτική διεπαφή επεξεργασίας υποστηρίζει μόνο βασικές ρυθμίσεις. Για πιο εξελιγμένες ρυθμίσεις χρησιμοποιήστε τη μέθοδο επεξεργασίας αρχείου YAML."},label:{name:"Τίτλος (προεραιτικό)",entity:"Οντότητα σκούπας (απαραίτητο)",camera:"Οντότητα κάμερας (απαραίτητο)",vacuum_platform:"Πλατφόρμα σκούπας (απαραίτητο)",map_locked:"Κλείδωμα χάρτη (προεραιτικό)",two_finger_pan:"Μετακίνηση με δύο δάχτυλα (προεραιτικό)",map_only:"Map only (optional)",platforms_documentation:"Τεκμηρίωση της επιλεγμένης πλατφόρμας ({0})",selection:"Επιλογή:",copy:"Αντιγραφή",copied:"Αντιγράφηκε!",set_static_config:"Δημιουργία στατικών ρυθμίσεων",config_set:"Ρύθμιση παραμέτρων!\nΑνοίξτε τον επεξεργαστή παραμέτρων για να τον προσαρμόσετε.",config_set_failed:"Απέτυχε η ενημέρωση των ρυθμίσεων.",generate_rooms_config:"Δημιουργία παραμέτρων δωματίων",copy_service_call:"Αντιγραφή κλήσης υπηρεσίας"}},wt={common:ht,map_mode:vt,validation:ft,tile:bt,icon:yt,unit:kt,popups:xt,editor:zt},At=Object.freeze({__proto__:null,common:ht,default:wt,editor:zt,icon:yt,map_mode:vt,popups:xt,tile:bt,unit:kt,validation:ft}),Et={version:"Version",invalid_configuration:"Invalid configuration {0}",description:"A card that lets you control your vacuum using a map",old_configuration:"Old configuration detected. Adjust your config to the latest schema or create a new card from the scratch.",old_configuration_migration_link:"Migration guide"},St={invalid:"Invalid template!",vacuum_goto:"Pin & Go",vacuum_goto_predefined:"Points",vacuum_clean_segment:"Rooms",vacuum_clean_point:"Clean point",vacuum_clean_point_predefined:"Points",vacuum_clean_zone:"Zone cleanup",vacuum_clean_zone_predefined:"Zones list",vacuum_follow_path:"Path"},Pt={preset:{entity:{missing:"Missing property: entity"},preset_name:{missing:"Missing property: preset_name"},platform:{invalid:"Invalid vacuum platform: {0}"},map_source:{missing:"Missing property: map_source",none_provided:"No camera neither image provided",ambiguous:"Only one map source allowed"},calibration_source:{missing:"Missing property: calibration_source",ambiguous:"Only one calibration source allowed",none_provided:"No calibration source provided",calibration_points:{invalid_number:"Exactly 3 or 4 calibration points required",missing_map:"Each calibration point must contain map coordinates",missing_vacuum:"Each calibration point must contain vacuum coordinates",missing_coordinate:"Map and vacuum calibration points must contain both x and y coordinate"}},icons:{invalid:"Error in configuration: icons",icon:{missing:"Each entry of icons list must contain icon property"}},tiles:{invalid:"Error in configuration: tiles",entity:{missing:"Each entry of tiles list must contain entity or internal variable"},label:{missing:"Each entry of tiles list must contain label"}},map_modes:{invalid:"Error in configuration: map_modes",icon:{missing:"Missing icon of map mode"},name:{missing:"Missing name of map mode"},template:{invalid:"Invalid template: {0}"},predefined_selections:{not_applicable:"Mode {0} does not support predefined selections",zones:{missing:"Missing zones configuration",invalid_parameters_number:"Each zone must have 4 parameters"},points:{position:{missing:"Missing points configuration",invalid_parameters_number:"Each point must have 2 parameters"}},rooms:{id:{missing:"Missing room id",invalid_format:"Invalid room id: {0}"},outline:{invalid_parameters_number:"Each point of room outline must have 2 parameters"}},label:{x:{missing:"Label must have x property"},y:{missing:"Label must have y property"},text:{missing:"Label must have text property"}},icon:{x:{missing:"Icon must have x property"},y:{missing:"Icon must have y property"},name:{missing:"Icon must have name property"}}},service_call_schema:{missing:"Missing service call schema",service:{missing:"Service call schema must contain service",invalid:"Invalid service: {0}"}}}},invalid_entities:"Invalid entities:",invalid_calibration:"Invalid calibration, please check your configuration"},Ct={status:{label:"Status",value:{starting:"Starting","charger disconnected":"Charger disconnected",idle:"Idle","remote control active":"Remote control active",cleaning:"Cleaning","returning home":"Returning home","manual mode":"Manual mode",charging:"Charging","charging problem":"Charging problem",paused:"Paused","spot cleaning":"Spot cleaning",error:"Error",sleeping:"Sleeping","shutting down":"Shutting down",updating:"Updating",docking:"Docking","going to target":"Going to target","zoned cleaning":"Zoned cleaning","segment cleaning":"Segment cleaning","emptying the bin":"Emptying the bin","charging complete":"Charging complete","device offline":"Device offline"}},battery_level:{label:"Battery"},fan_speed:{label:"Fan speed",value:{silent:"Silent",standard:"Standard",medium:"Medium",turbo:"Turbo",auto:"Auto",gentle:"Gentle",strong:"Strong"}},sensor_dirty_left:{label:"Sensors left"},filter_left:{label:"Filter left"},main_brush_left:{label:"Main brush left"},side_brush_left:{label:"Side brush left"},cleaning_count:{label:"Cleaning count"},cleaned_area:{label:"Cleaned area"},total_cleaned_area:{label:"Total cleaned area"},cleaning_time:{label:"Cleaning time"},total_cleaning_time:{label:"Total cleaning time"},mop_left:{label:"Mop left"},bin_full:{label:"Bin full",value:{true:"Yes",false:"No"}},bin_present:{label:"Bin present",value:{true:"Yes",false:"No"}},water_volume:{label:"Water volume"},mop_pad_humidity:{label:"Mop pad"},cleaning_mode:{label:"Cleaning mode",value:{sweeping:"Sweeping",mopping:"Mopping","sweeping and mopping":"Sweeping and mopping","mopping after sweeping":"Mopping after sweeping"}},tight_mopping:{label:"Tight mopping",value:{true:"Yes",false:"No"}},wetness_level:{label:"Wetness level"},mop_wash_level:{label:"Mop wash level",value:{deep:"Deep",daily:"Daily","water saving":"Water saving"}},auto_empty_mode:{label:"Auto empty mode",value:{off:"Off",standard:"Standard","high frequency":"High frequency","low frequency":"Low frequency"}},cleaning_route:{label:"Cleaning route",value:{quick:"Quick",standard:"Standard"}},cleangenius:{label:"CleanGenius",value:{off:"Off","routine cleaning":"Routine cleaning","deep cleaning":"Deep cleaning"}}},Mt={vacuum_start:"Start",vacuum_pause:"Pause",vacuum_stop:"Stop",vacuum_return_to_base:"Return to base",vacuum_clean_spot:"Clean spot",vacuum_locate:"Locate",vacuum_set_fan_speed:"Change fan speed"},Tt={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Rt={success:"Success!",no_selection:"No selection provided",failed:"Failed to call service",no_zone_mode:"No zone mode available. Check your configuration."},jt={tab:{room:"Room",all:"All",zone:"Zone"},action:{clean:"Clean",stop:"Stop",pause:"Pause",resume:"Resume",dock:"Dock",cancel:"Cancel",append:"Add to cleaning"},mode:{manual_section:"Manual modes"},map:{lock:"Lock map",unlock:"Unlock map",add_rectangle:"Add rectangle",cycle_repeats:"Cycle repeat count",recenter:"Recenter map"},status:{ready:"Ready"}},$t={description:{text:"This visual editor supports only a basic configuration. For more advanced setup use YAML mode."},helper:{entity:"Vacuum entity provided by your integration (e.g. dreame_vacuum).",camera:"Map camera exposing the live map image (usually named “… map”)."},section:{map_source:"Map source",display:"Display Options",map_behavior:"Map Behavior"},label:{show_title:"Show title",name:"Title (optional)",entity:"Vacuum entity (required)",camera:"Camera entity (required)",vacuum_platform:"Vacuum platform (required)",map_locked:"Map locked (optional)",two_finger_pan:"Two finger pan (optional)",map_only:"Map only (optional)",show_tiles:"Show information tiles",tiles_only:"Show only tiles (optional)",configure_tiles:"Configure tiles",tiles_loading:"Loading tiles...",platforms_documentation:"Chosen platform's documentation ({0})",selection:"Selection:",copy:"Copy",copied:"Copied!",set_static_config:"Generate static config",config_set:"Config set!\nOpen config editor to adjust it.",config_set_failed:"Failed to update config.",generate_rooms_config:"Generate rooms config",copy_service_call:"Copy service call",language:"Language override",clean_selection_on_start:"Clear selection on clean start",robot_overlay:"Robot overlay — anti-flash (optional)",map_source:"Map source",display:"Display",map_behavior:"Map behavior",appearance:"Appearance"},alerts:{set_static_config:"You should use this functionality only if you want to manually adjust automatically generated configuration.\nContinue?"},option:{appearance_premium:"Premium (translucent effects)",appearance_minimal:"Minimal (opaque, no ambient animations)"}},Nt={common:Et,map_mode:St,validation:Pt,tile:Ct,icon:Mt,unit:Tt,popups:Rt,dreame_ui:jt,editor:$t},It={version:"Versión",invalid_configuration:"Configuración no válida {0}",description:"Una tarjeta que te permite controlar la aspiradora",old_configuration:"Se ha detectado una configuración antigua. Ajusta tu configuración al último esquema o crea una nueva tarjeta desde cero.",old_configuration_migration_link:"Guía de migrado."},Lt={invalid:"¡Plantilla no válida!",vacuum_goto:"Marcar e ir",vacuum_goto_predefined:"Puntos",vacuum_clean_segment:"Habitaciones",vacuum_clean_point:"Limpiar punto",vacuum_clean_point_predefined:"Puntos",vacuum_clean_zone:"Limpiar zona",vacuum_clean_zone_predefined:"Lista de zonas",vacuum_follow_path:"Ruta"},Ot={preset:{entity:{missing:"Propiedad no encontrada: entity"},preset_name:{missing:"Propiedad no encontrada: preset_name"},platform:{invalid:"Plataforma de aspiradora no válida: {0}"},map_source:{missing:"Propiedad no encontrada: map_source",none_provided:"Sin cámara ni imagen proporcionada",ambiguous:"Solo se permite una fuente de mapa"},calibration_source:{missing:"Propiedad no encontrada: calibration_source",ambiguous:"Sólo se permite una fuente de calibración",none_provided:"No se proporciona fuente de calibración",calibration_points:{invalid_number:"Se requieren 3 o 4 puntos de calibración",missing_map:"Cada punto de calibración debe contener las coordenadas del mapa",missing_vacuum:"Cada punto de calibración debe contener las coordenadas de la aspiradora",missing_coordinate:"Los puntos de calibración de la aspiradora y del mapa deben contener las coordenadas x e y"}},icons:{invalid:"Error en la configuración: icons",icon:{missing:"Cada entrada de la lista de iconos debe contener la propiedad del icono."}},tiles:{invalid:"Error en la configuración: tiles",entity:{missing_outdated_translation:"Cada entrada de la lista de mosaicos debe contener la entidad."},label:{missing:"Cada entrada de la lista de mosaicos debe contener una etiqueta."}},map_modes:{invalid:"Error en la configuración: map_modes",icon:{missing:"Falta el icono del modo de mapa"},name:{missing:"Falta el nombre del modo de mapa"},template:{invalid:"Plantilla no válida: {0}"},predefined_selections:{not_applicable:"El modo {0} no admite selecciones predefinidas",zones:{missing:"Faltan configuraciones de zonas",invalid_parameters_number:"Cada zona debe tener 4 parámetros"},points:{position:{missing:"Faltan configuraciones de puntos",invalid_parameters_number:"Cada punto debe tener 2 parámetros"}},rooms:{id:{missing:"Falta la identificación de la habitación",invalid_format:"Identificación de la habitación no válida: {0}"},outline:{invalid_parameters_number:"Cada punto del contorno de la habitación debe tener 2 parámetros"}},label:{x:{missing:"La etiqueta debe tener la propiedad x"},y:{missing:"La etiqueta debe tener la propiedad y"},text:{missing:"La etiqueta debe tener la propiedad text"}},icon:{x:{missing:"El ícono debe tener la propiedad x"},y:{missing:"El ícono debe tener la propiedad y"},name:{missing:"El ícono debe tener la propiedad name"}}},service_call_schema:{missing:"Falta un esquema de llamada de servicio",service:{missing:"El esquema de llamada de servicio debe contener service",invalid:"Servicio no válido: {0}"}}}},invalid_entities:"Entidades no válidas:",invalid_calibration:"Calibración no válida, verifica la configuración."},Dt={status:{label:"Estado",value:{starting:"Iniciando","charger disconnected":"Cargador desconectado",idle:"Inactivo","remote control active":"Control remoto activo",cleaning:"Limpiando","returning home":"Volviendo a la base","manual mode":"Modo manual",charging:"Cargando","charging problem":"Error de carga",paused:"Pausado","spot cleaning":"Limpieza por puntos",error:"Error","shutting down":"Apagando",updating:"Actualizando",docking:"Acoplamiento","going to target":"Ir al objetivo","zoned cleaning":"Limpieza por zonas","segment cleaning":"Limpieza por segmentos","emptying the bin":"Vaciando el depósito","charging complete":"Carga completa","device offline":"Dispositivo desconectado"}},battery_level:{label:"Batería"},fan_speed:{label:"Velocidad del ventilador",value:{silent:"Silencioso",standard:"Normal",medium:"Medio",turbo:"Turbo",auto:"Automático",gentle:"Suave"}},sensor_dirty_left:{label:"Sensores"},filter_left:{label:"Filtro"},main_brush_left:{label:"Cepillo"},side_brush_left:{label:"Cepillo lateral"},cleaning_count:{label:"Contador de limpieza"},cleaned_area:{label:"Área limpiada"},total_cleaned_area:{label:"Área total limpiada"},cleaning_time:{label:"Tiempo de limpieza"},total_cleaning_time:{label:"Tiempo de limpieza total"},mop_left:{label:"Mopa"},bin_full:{label:"Contenedor lleno",value:{true:"Si",false:"No"}},bin_present:{label:"Contenedor presente",value:{true:"Si",false:"No"}},water_volume:{label:"Volúmen de agua"},mop_pad_humidity:{label:"Mopa"}},Vt={vacuum_start:"Iniciar",vacuum_pause:"Pausar",vacuum_stop:"Detener",vacuum_return_to_base:"Volver a la base",vacuum_clean_spot:"Limpiar punto",vacuum_locate:"Localizar",vacuum_set_fan_speed:"Cambiar la velocidad del ventilador"},Ut={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Kt={success:"¡Listo!",no_selection:"No se ha proporcionado ninguna selección",failed:"No se pudo llamar al servicio"},Ft={description:{text:"Este editor visual sólo admite una configuración básica. Para una configuración más avanzada, utiliza el modo YAML."},label:{name:"Título (opcional)",entity:"Entidad de la aspiradora (requerido)",camera:"Entidad de la cámara (requerido)",vacuum_platform:"Plataforma de la aspiradora (requerido)",map_locked:"Bloquear mapa (opcional)",two_finger_pan:"Mover con dos dedos (opcional)",map_only:"Map only (optional)",platforms_documentation:"Plataforma de documentación elegida ({0})",selection:"Selección:",copy:"Copiar",copied:"¡Copiado!",set_static_config:"Generar configuración estática",config_set:"¡Configuración establecida!\nAbre el editor de configuración para ajustarla.",config_set_failed:"Error al actualizar la configuración.",generate_rooms_config:"Generar la configuración de habitaciones",copy_service_call:"Copiar la llamada al servicio"},alerts:{set_static_config:"Sólo se debe utilizar esta función si desea ajustar la configuración generada automáticamente..\n¿Continuar?"}},qt={common:It,map_mode:Lt,validation:Ot,tile:Dt,icon:Vt,unit:Ut,popups:Kt,editor:Ft},Ht={version:"Versio",invalid_configuration:"Virheellinen määritys {0}",description:"Kortti, jolla voit hallita imuriasi",old_configuration:"Vanha rakenne havaittu. Muokkaa rakenne viimeisimmän skeeman mukaiseksi tai luo uusi kortti.",old_configuration_migration_link:"Migraatio-ohje"},Gt={invalid:"Virheellinen malli!",vacuum_goto:"Pin & Go",vacuum_goto_predefined:"Pisteet",vacuum_clean_segment:"Huoneet",vacuum_clean_point:"Puhdista piste",vacuum_clean_point_predefined:"Pisteet",vacuum_clean_zone:"Aluepuhdistus",vacuum_clean_zone_predefined:"Alueet",vacuum_follow_path:"Reitti"},Bt={preset:{entity:{missing:"Puuttuva ominaisuus: entity"},preset_name:{missing:"Puuttuva ominaisuus: preset_name"},platform:{invalid:"Virheellinen imurin alusta: {0}"},map_source:{missing:"Puuttuva ominaisuus: map_source",none_provided:"Ei kameraa eikä kuvaa",ambiguous:"Vain yksi karttalähde sallittu"},calibration_source:{missing:"Puuttuva ominaisuus: calibration_source",ambiguous:"Vain yksi kalibrointilähde on sallittu",none_provided:"Kalibrointilähde puuttuu",calibration_points:{invalid_number:"Tarvitaan täsmälleen 3 tai 4 kalibrointipistettä",missing_map:"Jokaisen kalibrointipisteen tulee sisältää karttakoordinaatit",missing_vacuum:"Jokaisen kalibrointipisteen tulee sisältää imurikoordinaatit",missing_coordinate:"Kartta- ja imurikalibrointipisteiden tulee sisältää sekä x- että y-koordinaatit"}},icons:{invalid:"Virhe määrityksessä: icons",icon:{missing:"Jokaisen kuvakeluettelon merkinnän tulee sisältää kuvakeominaisuus"}},tiles:{invalid:"Virhe määrityksessä: tiles",entity:{missing:"Jokaisen ruutuluettelon merkinnän on sisällettävä entiteetti tai sisäinen muuttuja"},label:{missing:"Jokaisen ruutuluettelon merkinnän on sisällettävä tunniste"}},map_modes:{invalid:"Virhe määrityksessä: map_modes",icon:{missing:"Karttatilan kuvake puuttuu"},name:{missing:"Karttatilan nimi puuttuu"},template:{invalid:"Virheellinen malli: {0}"},predefined_selections:{not_applicable:"Tila {0} ei tue ennalta määritettyjä valintoja",zones:{missing:"Alueiden määritys puuttuu",invalid_parameters_number:"Jokaisella alueella on oltava 4 parametria"},points:{position:{missing:"Pisteiden määritys puuttuu",invalid_parameters_number:"Jokaisella pisteellä on oltava 2 parametria"}},rooms:{id:{missing:"Huoneen id puuttuu",invalid_format:"Virheellinen huoneen id: {0}"},outline:{invalid_parameters_number:"Jokaisella huoneen ääriviivan pisteellä on oltava 2 parametria"}},label:{x:{missing:"Tunnisteella on oltava x-ominaisuus"},y:{missing:"Tunnisteella on oltava y-ominaisuus"},text:{missing:"Tunnisteella on oltava tekstiominaisuus"}},icon:{x:{missing:"Kuvakkeella on oltava x-ominaisuus"},y:{missing:"Kuvakkeella on oltava y-ominaisuus"},name:{missing:"Kuvakkeella on oltava nimiominaisuus"}}},service_call_schema:{missing:"Puuttuva palvelukutsuskeema",service:{missing:"Palvelukutsuskeeman tulee sisältää palvelu",invalid:"Virheellinen palvelu: {0}"}}}},invalid_entities:"Virheelliset entiteetit:",invalid_calibration:"Virheellinen kalibrointi, tarkista asetukset"},Zt={status:{label:"Tila",value:{starting:"Käynnistetään","charger disconnected":"Laturi irroitettu",idle:"Lepotila","remote control active":"Kaukosäädin aktiivinen",cleaning:"Puhdistetaan","returning home":"Palataan telakkaan","manual mode":"Manuaalinen tila",charging:"Ladataan","charging problem":"Latausvirhe",paused:"Tauotettu","spot cleaning":"Kohdan puhdistus",error:"Virhe","shutting down":"Sammutetaan",updating:"Päivitetään",docking:"Telakoidutaan","going to target":"Mennään kohteeseen","zoned cleaning":"Aluepuhdistus","segment cleaning":"Segmentin puhdistus","emptying the bin":"Tyhjennetään säiliötä","charging complete":"Lataus valmis","device offline":"Laite poissa päältä"}},battery_level:{label:"Akku"},fan_speed:{label:"Tuulettimen nopeus",value:{silent:"Hiljainen",standard:"Vakio",medium:"Keskinopeus",turbo:"Turbo",auto:"Auto",gentle:"Kevyt"}},sensor_dirty_left:{label:"Anturit jäljellä"},filter_left:{label:"Suodatin jäljellä"},main_brush_left:{label:"Pääharja jäljellä"},side_brush_left:{label:"Sivuharja jäljellä"},cleaning_count:{label:"Puhdistusmäärä"},cleaned_area:{label:"Puhdistettu alue"},total_cleaned_area:{label:"Puhdistettu alue yhteensä"},cleaning_time:{label:"Puhdistusaika"},total_cleaning_time:{label:"Kokonaispuhdistusaika"},mop_left:{label:"Moppi jäljellä"},bin_full:{label:"Säiliö täynnä",value:{true:"Kyllä",false:"Ei"}},bin_present:{label:"Säiliö löytyy",value:{true:"Kyllä",false:"Ei"}},water_volume:{label:"Veden määrä"},mop_pad_humidity:{label:"Moppi tyyny"}},Yt={vacuum_start:"Käynnistä",vacuum_pause:"Tauko",vacuum_stop:"Pysäytä",vacuum_return_to_base:"Palaa telakkaan",vacuum_clean_spot:"Siivoa kohta",vacuum_locate:"Paikanna",vacuum_set_fan_speed:"Vaihda tuulettimen nopeutta"},Xt={hour_shortcut:"t",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Wt={success:"Onnistui!",no_selection:"Valintoja ei annettu",failed:"Virhe kutsuessa palvelua"},Jt={description:{text:"Visuaalinen editori tukee vain peruskokoonpanoa. Käytä YAML-tilaa edistyneempään asennukseen."},label:{name:"Otsikko (valinnainen)",entity:"Imuri entiteetti (vaadittu)",camera:"Kamera entiteetti (vaadittu)",vacuum_platform:"Imurin alusta (vaadittu)",map_locked:"Kartta lukittu (valinnainen)",two_finger_pan:"Liikuta karttaa kahdella sormella (valinnainen)",map_only:"Map only (optional)",platforms_documentation:"Valitun alustan dokumentaatio ({0})",selection:"Valinta:",copy:"Kopioi",copied:"Kopioitu!",set_static_config:"Luo staattiset asetukset",config_set:"Määritykset asetettu!\nMuokkaa sitä avaamalla asetuseditori.",config_set_failed:"Konfiguroinnin päivitys epäonnistui.",generate_rooms_config:"Luo huoneiden asetukset",copy_service_call:"Kopioi palvelukutsu"},alerts:{set_static_config:"Käytä tätä toimintoa vain, jos haluat säätää automaattisesti luotuja määrityksiä manuaalisesti.\nJatketaanko?"}},Qt={common:Ht,map_mode:Gt,validation:Bt,tile:Zt,icon:Yt,unit:Xt,popups:Wt,editor:Jt},ea={version:"Version",invalid_configuration:"Configuration invalide {0}",description:"Une carte qui vous permet de contrôler votre robot aspirateur",old_configuration:"Ancienne configuration détectée. Ajustez votre configuration à la nouvelle version ou récréez totalement une nouvelle carte.",old_configuration_migration_link:"Guide de migration"},ta={invalid:"Template incorrect !",vacuum_goto:"Cible",vacuum_goto_predefined:"Points",vacuum_clean_segment:"Pièces",vacuum_clean_point:"Nettoyage ciblé",vacuum_clean_point_predefined:"Points",vacuum_clean_zone:"Nettoyage de zone",vacuum_clean_zone_predefined:"Liste des zones",vacuum_follow_path:"Chemin"},aa={preset:{entity:{missing:"Paramètre manquant : entity"},preset_name:{missing:"Paramètre manquant : preset_name"},platform:{invalid:"Plateforme incorrecte : {0}"},map_source:{missing:"Paramètre manquant : map_source",none_provided:"Aucune caméra ou image fournie",ambiguous:"Une seule source de carte autorisée"},calibration_source:{missing:"Paramètre manquant : calibration_source",ambiguous:"Une seule source de calibration autorisée",none_provided:"Aucune source de calibration fournie",calibration_points:{invalid_number:"3 ou 4 points de calibration sont nécessaires",missing_map:"Chaque point de calibration doit avoir des coordonnées de carte",missing_vacuum:"Chaque point de calibration doit avoir des coordonnées de robot",missing_coordinate:"Tous les points de calibration doivent avoir des coordonnées x et y"}},icons:{invalid:"Erreur de configuration : icônes",icon:{missing:"Chaque élément de la liste d'icônes doit avoir une propriété « icon »"}},tiles:{invalid:"Erreur de configuration : tuiles",entity:{missing:"Chaque élément de la liste de tuiles doit avoir une propriété « entity » ou une variable interne"},label:{missing:"Chaque élément de la liste de tuiles doit avoir une propriété « label »"}},map_modes:{invalid:"Erreur de configuration : modes de carte",icon:{missing:"Icône de mode de carte manquante"},name:{missing:"Nom de mode de carte manquant"},template:{invalid:"Template incorrect : {0}"},predefined_selections:{not_applicable:"Ce mode {0} ne supporte pas les sélections prédéfinies",zones:{missing:"Configuration des zones manquante",invalid_parameters_number:"Chaque zone doit avoir 4 paramètres"},points:{position:{missing:"Configuration des points manquante",invalid_parameters_number:"Chaque point doit avoir 2 paramètres"}},rooms:{id:{missing:"id de pièce manquant",invalid_format:"id de pièce incorrect : {0}"},outline:{invalid_parameters_number:"Chaque point de contour de pièce doit avoir 2 paramètres"}},label:{x:{missing:"L'étiquette doit avoir une propriété « x »"},y:{missing:"L'étiquette doit avoir une propriété « y »"},text:{missing:"L'étiquette doit avoir une propriété « text »"}},icon:{x:{missing:"L'icône doit avoir une propriété « x »"},y:{missing:"L'icône doit avoir une propriété « y »"},name:{missing:"L'icône doit avoir une propriété « name »"}}},service_call_schema:{missing:"Schéma d'appel du service manquant",service:{missing:"Le schéma doit contenir un service",invalid:"Service incorrect : {0}"}}}},invalid_entities:"Entités incorrectes :",invalid_calibration:"Calibration incorrecte, vérifiez votre configuration"},ia={status:{label:"Statut",value:{starting:"Démarrage...","charger disconnected":"Chargeur déconnecté",idle:"Inactif","remote control active":"Télécommande active",cleaning:"Nettoyage","returning home":"Retour à la station","manual mode":"Mode manuel",charging:"En charge","charging problem":"Problème de chargement",paused:"En pause","spot cleaning":"Nettoyage ciblé",error:"Erreur",sleeping:"En veille","shutting down":"Arrêt en cours...",updating:"Mise à jour",docking:"Retour à la station","going to target":"En route vers la cible","zoned cleaning":"Nettoyage de zone","segment cleaning":"Nettoyage de pièce","emptying the bin":"Vidage du réservoir","charging complete":"Chargement terminé","device offline":"Hors ligne"}},battery_level:{label:"Batterie"},fan_speed:{label:"Puissance",value:{silent:"Silencieux",standard:"Standard",medium:"Moyen",turbo:"Turbo",auto:"Auto",gentle:"Calme",strong:"Puissant"}},sensor_dirty_left:{label:"Capteurs"},filter_left:{label:"Filtre"},main_brush_left:{label:"Brosse principale"},side_brush_left:{label:"Brosse latérale"},cleaning_count:{label:"Nombre de nettoyages"},cleaned_area:{label:"Surface nettoyée"},total_cleaned_area:{label:"Surface totale nettoyée"},cleaning_time:{label:"Durée de nettoyage"},total_cleaning_time:{label:"Durée totale de nettoyage"},mop_left:{label:"Serpillère"},bin_full:{label:"Réservoir plein",value:{true:"Oui",false:"Non"}},bin_present:{label:"Réservoir présent",value:{true:"Oui",false:"Non"}},water_volume:{label:"Volume d'eau"},mop_pad_humidity:{label:"Humidité de la serpillère"},cleaning_mode:{label:"Mode de nettoyage",value:{sweeping:"Balayage",mopping:"Serpillière","sweeping and mopping":"Balayage et serpillière","mopping after sweeping":"Serpillière après balayage"}},tight_mopping:{label:"Lavage renforcé",value:{true:"Oui",false:"Non"}},wetness_level:{label:"Niveau d'humidité"},mop_wash_level:{label:"Niveau de lavage",value:{deep:"Profond",daily:"Quotidien","water saving":"Économie d'eau"}},auto_empty_mode:{label:"Mode de vidage auto",value:{off:"Désactivé",standard:"Standard","high frequency":"Haute fréquence","low frequency":"Basse fréquence"}},cleaning_route:{label:"Itinéraire de nettoyage",value:{quick:"Rapide",standard:"Standard"}},cleangenius:{label:"CleanGenius",value:{off:"Désactivé","routine cleaning":"Nettoyage de routine","deep cleaning":"Nettoyage en profondeur"}}},na={vacuum_start:"Démarrage",vacuum_pause:"Pause",vacuum_stop:"Stop",vacuum_return_to_base:"Retour à la station",vacuum_clean_spot:"Nettoyage ciblé",vacuum_locate:"Localiser",vacuum_set_fan_speed:"Changer la puissance"},oa={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},ra={success:"Réussi !",no_selection:"Sélection non fournie",failed:"L'appel au service a échoué",no_zone_mode:"Aucun mode de zone disponible. Vérifiez votre configuration."},sa={tab:{room:"Pièce",all:"Toutes",zone:"Zone"},action:{clean:"Nettoyer",stop:"Stop",pause:"Pause",resume:"Reprendre",dock:"Station d'accueil",cancel:"Annuler",append:"Ajouter au nettoyage"},mode:{manual_section:"Modes manuels"},map:{lock:"Verrouiller la carte",unlock:"Déverrouiller la carte",add_rectangle:"Ajouter une zone",cycle_repeats:"Changer le nombre de répétitions",recenter:"Recentrer la carte"},status:{ready:"Prêt"}},la={description:{text:"Cet éditeur visuel ne permet qu'une configuration de base. Pour un paramétrage plus avancé, utilisez le mode YAML."},helper:{entity:"Entité de l'aspirateur fournie par votre intégration (ex. dreame_vacuum).",camera:"Caméra de carte exposant l'image de la carte en direct (généralement nommée « … map »)."},section:{map_source:"Source de la carte",display:"Options d'affichage",map_behavior:"Comportement de la carte"},label:{show_title:"Afficher le titre",name:"Titre (optionnel)",entity:"Entité de l'aspirateur (obligatoire)",camera:"Entité de la caméra (obligatoire)",vacuum_platform:"Plateforme (obligatoire)",map_locked:"Carte verrouillée (optionnel)",two_finger_pan:"Déplacement à deux doigts (optionnel)",map_only:"Carte uniquement (optionnel)",show_tiles:"Afficher les tuiles d'informations",tiles_only:"Afficher uniquement les tuiles (optionnel)",configure_tiles:"Configurer les tuiles",tiles_loading:"Chargement des tuiles...",platforms_documentation:"Documentation de la plateforme choisie ({0})",selection:"Sélection :",copy:"Copier",copied:"Copié !",set_static_config:"Générer la configuration statique",config_set:"Configuration définie !\nOuvrez l'éditeur de configuration pour l'ajuster.",config_set_failed:"Échec de la mise à jour de la configuration.",generate_rooms_config:"Générer la configuration des pièces",copy_service_call:"Copier l'appel de service",language:"Langue (surcharge)",clean_selection_on_start:"Effacer la sélection au démarrage",robot_overlay:"Superposition du robot — anti-clignotement (optionnel)",map_source:"Source de la carte",display:"Affichage",map_behavior:"Comportement de la carte",appearance:"Apparence"},alerts:{set_static_config:"Vous devez utiliser cette fonctionnalité uniquement si vous souhaitez ajuster manuellement la configuration générée automatiquement.\nContinuer ?"},option:{appearance_premium:"Premium (effets translucides)",appearance_minimal:"Minimale (opaque, sans animations ambiantes)"}},ca={common:ea,map_mode:ta,validation:aa,tile:ia,icon:na,unit:oa,popups:ra,dreame_ui:sa,editor:la},da={version:"גרסה",invalid_configuration:"תצורה לא חוקית {0}",description:"כרטיס המאפשר לך לשלוט בשואב שלך",old_configuration:"זוהתה תצורה ישנה. יש להתאים את התצורה שלך לסכמה העדכנית ביותר או ליצור כרטיס חדש מההתחלה.",old_configuration_migration_link:"מדריך להגירה"},ua={invalid:"תבנית לא חוקית!",vacuum_goto:"נעץ וסע",vacuum_goto_predefined:"נקודות",vacuum_clean_segment:"חדרים",vacuum_clean_point:"ניקוי נקודה",vacuum_clean_point_predefined:"נקודות",vacuum_clean_zone:"ניקוי אזור",vacuum_clean_zone_predefined:"רשימת אזורים",vacuum_follow_path:"נתיב"},ma={preset:{entity:{missing:"חסר מאפיין: ישות"},preset_name:{missing:"חסר מאפיין: preset_name"},platform:{invalid:"פלטפורמת שואב לא חוקית: {0}"},map_source:{missing:"חסר מאפיין: map_source",none_provided:"לא סופקה אף תמונה",ambiguous:"ניתן להשתמש במקור מפה אחד בלבד"},calibration_source:{missing:"חסר מאפיין: calibration_source",ambiguous:"מותר מקור כיול אחד בלבד",none_provided:"לא סופק מקור כיול",calibration_points:{invalid_number:"דרושות בדיוק 3 או 4 נקודות כיול",missing_map:"כל נקודת כיול חייבת להכיל קואורדינטות מפה",missing_vacuum:"כל נקודת כיול חייבת להכיל קואורדינטות שואב",missing_coordinate:"נקודות כיול במפה ובשואב חייבות להכיל גם קואורדינטות x וגם y"}},icons:{invalid:"שגיאת תצורה: סמלילים",icon:{missing:"כל כניסה של רשימת הסמלילים חייבת להכיל מאפיין סמליל"}},tiles:{invalid:"שגיאת תצורה: אריחים",entity:{missing:"כל ערך של רשימת אריחים חייב להכיל ישות"},label:{missing:"כל כניסה של רשימת אריחים חייבת להכיל תווית"}},map_modes:{invalid:"שגיאת תצורה: map_modes",icon:{missing:"חסר סמליל של מצב מפה"},name:{missing:"חסר שם של מצב מפה"},template:{invalid:"תבנית לא חוקית: {0}"},predefined_selections:{not_applicable:"מצב {0} אינו תומך בבחירות מוגדרות מראש",zones:{missing:"תצורת אזורים חסרים",invalid_parameters_number:"כל אזור חייב לכלול 4 פרמטרים"},points:{position:{missing:"תצורת נקודות חסרות",invalid_parameters_number:"לכל נקודה חייבת להיות 2 פרמטרים"}},rooms:{id:{missing:"מזהה חדר חסר",invalid_format:"מזהה חדר לא חוקי: {0}"},outline:{invalid_parameters_number:"כל נקודה של מתאר החדר חייבת להיות בעלת 2 פרמטרים"}},label:{x:{missing:"חייב להיות מאפיין x לתבנית"},y:{missing:"חייב להיות מאפיין y לתבנית"},text:{missing:"חייב להיות מאפיין שם לתבנית"}},icon:{x:{missing:"חייב להיות מאפיין x לסמליל"},y:{missing:"חייב להיות מאפיין y לסמליל"},name:{missing:"חייב להיות מאפיין שם לסמליל"}}},service_call_schema:{missing:"סכימת קריאת שירות חסרה",service:{missing:"סכימת קריאת השירות חייבת להכיל שירות",invalid:"שירות לא חוקי: {0}"}}}},invalid_entities:"ישויות לא חוקיות:",invalid_calibration:"כיול לא חוקי, אנא בדוק את התצורה שלך"},pa={status:{label:"סטטוס",value:{starting:"מתחיל","charger disconnected":"המטען מנותק",idle:"ממתין","remote control active":"שליטה מרוחק פעילה",cleaning:"מנקה","returning home":"חוזר הביתה","manual mode":"מצב ידני",charging:"טעינה","charging problem":"בעיית טעינה",paused:"מושהה","spot cleaning":"ניקוי נקודתי",error:"שגיאה","shutting down":"מתכבה",updating:"מתעדכן",docking:"בעגינה","going to target":"בדרך אל היעד","zoned cleaning":"ניקוי אזור","segment cleaning":"ניקוי מקטע","emptying the bin":"ריקון האשפה","charging complete":"טעינה הושלמה","device offline":"התקן לא מקוון"}},battery_level:{label:"סוללה"},fan_speed:{label:"מהירות מאוורר",value:{silent:"שקט",standard:"סטנדרט",medium:"בינוני",turbo:"טורבו",auto:"אוטומט",gentle:"עדין"}},sensor_dirty_left:{label:"נותר לחיישנים"},filter_left:{label:"נותר למסנן"},main_brush_left:{label:"נותר למברשת ראשית"},side_brush_left:{label:"נותר למברשת צד"},cleaning_count:{label:"כמות נקיונות"},cleaned_area:{label:"שטח שנוקה"},total_cleaned_area:{label:"סך השטח שנוקה"},cleaning_time:{label:"זמן ניקיון"},total_cleaning_time:{label:"סך זמן הניקיון"},mop_left:{label:"נותר למטלית"},bin_full:{label:"פח מלא",value:{true:"כן",false:"לא"}},bin_present:{label:"מיכל קיים",value:{true:"כן",false:"לא"}},water_volume:{label:"רמת מים"},mop_pad_humidity:{label:"משטח ניגוב"}},ga={vacuum_start:"התחלה",vacuum_pause:"השהייה",vacuum_stop:"עצירה",vacuum_return_to_base:"חוזר לתחנת עגינה",vacuum_clean_spot:"ניקוי נקודה",vacuum_locate:"איתור",vacuum_set_fan_speed:"שינוי מהירות מאוורר"},_a={hour_shortcut:"ש",meter_shortcut:"מ",meter_squared_shortcut:'מ"ר',minute_shortcut:"דק"},ha={success:"הצליח!",no_selection:"לא סופקה בחירה",failed:"התקשרות לשירות נכשלה"},va={description:{text:"עורך חזותי זה תומך רק בתצורה בסיסית.להגדרה מתקדמת יותר יש להשתמש במצב YAML."},label:{name:"כותרת (אופציונלי)",entity:"יישות שואב (נדרש)",camera:"יישות מצלמה (נדרש)",vacuum_platform:"פלטפורמת שואב (נדרש)",map_locked:"נעילת מפה (אופציונלי)",two_finger_pan:"צביטת שתי אצבעות (אופציונלי)",map_only:"Map only (optional)",platforms_documentation:"תיעוד הפלטפורמה שנבחרה ({0})",selection:"בחירה:",copy:"העתקה",copied:"הועתק!",set_static_config:"יצירת תצורה סטטית",config_set:"תצורה הוגדרה!\nיש לפתוח את עורך התצורה כדי להתאים אותו.",config_set_failed:"עדכון התצורה נכשל.",generate_rooms_config:"יצירת תצורת חדרים",copy_service_call:"העתקת קריאת שירות"},alerts:{set_static_config:"עליך להשתמש בפונקציונליות זו רק אם ברצונך להתאים באופן ידני את התצורה שנוצרה באופן אוטומטי.\nלהמשיך?"}},fa={common:da,map_mode:ua,validation:ma,tile:pa,icon:ga,unit:_a,popups:ha,editor:va},ba={version:"Verzió",invalid_configuration:"Érvénytelen konfiguráció {0}",description:"Egy kártya, amely segítségével térképet használva irányíthatja a porszívóját",old_configuration:"Régi konfiguráció észlelve. Módosítsa a konfigurációt a legfrissebb séma szerint, vagy hozzon létre egy új kártyát.",old_configuration_migration_link:"Áttelepítési útmutató"},ya={invalid:"Érvénytelen sablon!",vacuum_goto:"Jelölj & menj",vacuum_goto_predefined:"Pontok",vacuum_clean_segment:"Szobák",vacuum_clean_point:"Tisztítási pont",vacuum_clean_point_predefined:"Pontok",vacuum_clean_zone:"Zóna takarítás",vacuum_clean_zone_predefined:"Zónák listája",vacuum_follow_path:"Útvonal"},ka={preset:{entity:{missing:"Hiányzó tulajdonság: entity"},preset_name:{missing:"Hiányzó tulajdonság: preset_name"},platform:{invalid:"Érvénytelen porszívó platform: {0}"},map_source:{missing:"Hiányzó tulajdonság: map_source",none_provided:"Nem áll rendelkezésre kamera vagy kép",ambiguous:"Csak egy térképforrás engedélyezett"},calibration_source:{missing:"Hiányzó tulajdonság: calibration_source",ambiguous:"Csak egy kalibrálási forrás engedélyezett",none_provided:"Nincs kalibrálási forrás megadva",calibration_points:{invalid_number:"Pontosan 3 vagy 4 kalibrálási pont szükséges",missing_map:"Minden kalibrálási pontnak tartalmaznia kell térkép koordinátákat",missing_vacuum:"Minden kalibrálási pontnak tartalmaznia kell porszívó koordinátákat",missing_coordinate:"A térkép- és porszívó kalibrálási pontoknak mindkét x és y koordinátát tartalmazniuk kell"}},icons:{invalid:"Hiba a konfigurációban: icons",icon:{missing:"Az ikonok listájának minden bejegyzésének tartalmaznia kell ikon tulajdonságot"}},tiles:{invalid:"Hiba a konfigurációban: tiles",entity:{missing:"A csempék listájának minden bejegyzésének tartalmaznia kell entitást vagy belső változót"},label:{missing:"A csempék listájának minden bejegyzésének tartalmaznia kell címkét"}},map_modes:{invalid:"Hiba a konfigurációban: map_modes",icon:{missing:"Hiányzó térképmód ikon"},name:{missing:"Hiányzó térképmód név"},template:{invalid:"Érvénytelen sablon: {0}"},predefined_selections:{not_applicable:"A(z) {0} mód nem támogatja az előre meghatározott kijelöléseket",zones:{missing:"Hiányzó zónák konfigurációja",invalid_parameters_number:"Minden zónának 4 paraméterrel kell rendelkeznie"},points:{position:{missing:"Hiányzó pontok konfigurációja",invalid_parameters_number:"Minden pontnak 2 paraméterrel kell rendelkeznie"}},rooms:{id:{missing:"Hiányzó szoba azonosító",invalid_format:"Érvénytelen szoba azonosító: {0}"},outline:{invalid_parameters_number:"A helyiség körvonalának minden pontján 2 paraméterrel kell rendelkeznie"}},label:{x:{missing:"A címkének tartalmaznia kell az x tulajdonságot"},y:{missing:"A címkének tartalmaznia kell az y tulajdonságot"},text:{missing:"A címkének tartalmaznia kell szöveg tulajdonságot"}},icon:{x:{missing:"Az ikonnak tartalmaznia kell at x tulajdonságot"},y:{missing:"Az ikonnak tartalmaznia kell az y tulajdonságot"},name:{missing:"Az ikonnak tartalmaznia kell név tulajdonságot"}}},service_call_schema:{missing:"Hiányzó szolgáltatáshívási séma",service:{missing:"A szolgáltatáshívási sémának tartalmaznia kell a szolgáltatást",invalid:"Érvénytelen szolgáltatás: {0}"}}}},invalid_entities:"Érvénytelen entitások:",invalid_calibration:"Érvénytelen kalibrálás, kérjük, ellenőrizze a konfigurációját"},xa={status:{label:"Állapot",value:{starting:"Indítás","charger disconnected":"Töltő leválasztva",idle:"Tétlen","remote control active":"Távirányítás aktív",cleaning:"Takarítás","returning home":"Hazatérés","manual mode":"Kézi üzemmód",charging:"Töltés","charging problem":"Töltési probléma",paused:"Szüneteltetve","spot cleaning":"Célzott takarítás",error:"Hiba","shutting down":"Kikapcsolás",updating:"Frissítés",docking:"Dokkolás","going to target":"Cél felé halad","zoned cleaning":"Zóna takarítás","segment cleaning":"Szegmens takarítás","emptying the bin":"Kosár ürítés","charging complete":"Töltés befejezve","device offline":"Eszköz nem elérhető"}},battery_level:{label:"Akkumulátor"},fan_speed:{label:"Ventilátor sebessége",value:{silent:"Csendes",standard:"Normál",medium:"Közepes",turbo:"Turbó",auto:"Automatikus",gentle:"Gyengéd"}},sensor_dirty_left:{label:"Érzékelők"},filter_left:{label:"Szűrő"},main_brush_left:{label:"Főkefe"},side_brush_left:{label:"Oldalkefe"},cleaning_count:{label:"Takarítások száma"},cleaned_area:{label:"Takarított terület"},total_cleaned_area:{label:"Összesen takarított terület"},cleaning_time:{label:"Takarítási idő"},total_cleaning_time:{label:"Összes takarítási idő"},mop_left:{label:"Felmosó"},bin_full:{label:"Kosár megtelt",value:{true:"Igen",false:"Nem"}},bin_present:{label:"Kosár behlyezve",value:{true:"Igen",false:"Nem"}},water_volume:{label:"Víz mennyisége"},mop_pad_humidity:{label:"Felmosópárna"}},za={vacuum_start:"Indítás",vacuum_pause:"Szünet",vacuum_stop:"Leállítás",vacuum_return_to_base:"Visszatérés a dokkolóhoz",vacuum_clean_spot:"Célzott takarítás",vacuum_locate:"Porszívó megkeresése",vacuum_set_fan_speed:"Ventilátor sebesség módosítása"},wa={hour_shortcut:"ó",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"p"},Aa={success:"Siker!",no_selection:"Nincs kiválasztva",failed:"Nem sikerült meghívni a szolgáltatást"},Ea={description:{text:"Ez a vizuális szerkesztő csak egy alap konfigurációt támogat. Továbbfejlesztett beállításhoz használja a YAML módot."},label:{name:"Cím (opcionális)",entity:"Porszívó entitás (kötelező)",camera:"Kamera entitás (kötelező)",vacuum_platform:"Porszívó platform (kötelező)",map_locked:"Térkép zárolva (opcionális)",two_finger_pan:"Kétujjas pásztázás (opcionális)",map_only:"Map only (optional)",platforms_documentation:"Kiválasztott platform dokumentációja ({0})",selection:"Kiválasztás:",copy:"Másolás",copied:"Másolva!",set_static_config:"Statikus konfiguráció generálása",config_set:"Konfiguráció beállítva!\nNyissa meg a konfiguráció szerkesztőt a beállítások módosításához.",config_set_failed:"Nem sikerült a konfigurációt frissíteni.",generate_rooms_config:"Szobák konfigurációjának generálása",copy_service_call:"Szolgáltatáshívás másolása"},alerts:{set_static_config:"Ezt a funkcionalitást csak akkor kell használni, ha manuálisan szeretné módosítani az automatikusan generált konfigurációt.\nFolytatja?"}},Sa={common:ba,map_mode:ya,validation:ka,tile:xa,icon:za,unit:wa,popups:Aa,editor:Ea},Pa={version:"Útgáfa",invalid_configuration:"Ógildar stillingar {0}",description:"Spjald sem leyfir þér að stjórna ryksuguvélmenni þínu",old_configuration:"Gamlar stillingar fundust. Uppfærðu stillingarnar fyrir nýjustu útgáfu eða búðu til nýtt spjald frá grunni.",old_configuration_migration_link:"Aðlögunar leiðbeiningar"},Ca={invalid:"Ógilt sniðmát!",vacuum_goto:"Velja og af stað!",vacuum_goto_predefined:"Deplar",vacuum_clean_segment:"Herbergi",vacuum_clean_point:"Hreinn depill",vacuum_clean_point_predefined:"Deplar",vacuum_clean_zone:"Þrífa svæði",vacuum_clean_zone_predefined:"Svæðislistar",vacuum_follow_path:"Ferill"},Ma={preset:{entity:{missing:"Vantar einingu: entity"},preset_name:{missing:"Vantar einingu: preset_name"},platform:{invalid:"Rangt ryksugu sniðmát: {0}"},map_source:{missing:"Vantar einingu: map_source",none_provided:"Enginn myndavél né mynd er skráð",ambiguous:"Aðeins einn uppruni fyrir kort leyfður"},calibration_source:{missing:"Vantar einindi: calibration_source",ambiguous:"Aðeins ein kvörðunar stilling leyfð",none_provided:"Engin kvörðunarstilling er skilgreind",calibration_points:{invalid_number:":Þú verður að skilagreina nákvæmlega 3 eða 4 kvörðunar punkta",missing_map:"Hver punktur verður að vera hnit á kortinu",missing_vacuum:"Hver punktur á kortinu verður að vera hnit fyrir ryksuguna.",missing_coordinate:"Kort og ryksugu stillingar verða að innihalda x og y hnit"}},icons:{invalid:"Villa í stillingum: icons",icon:{missing:'Hver færsla fyrir smámynd verður að innihalda "icon" stillingu'}},tiles:{invalid:"Villa í stillingum: tiles",entity:{missing_outdated_translation:'Hver færsla á lista verður að innihalda "entity"'},label:{missing:'Hver færsla á lista verður að innihalda "label"'}},map_modes:{invalid:"Villa í stillingum: map_modes",icon:{missing:'Það vantar "icon" fyrir kortaham'},name:{missing:'Það vantar "name" einindið fyrir kortaham'},template:{invalid:"Rangt sniðmát: {0}"},predefined_selections:{not_applicable:"Hamur {0} styður ekki fyrirfram skilgreint val",zones:{missing:"Það vantar skilgreiningar fyrir svæði",invalid_parameters_number:"Hvert svæði verður að hafa 4 færibreytur"},points:{position:{missing:"Það vantar stillingar fyrir hnit",invalid_parameters_number:"Hvert hnit verður að hafa 2 færibreytur"}},rooms:{id:{missing:"Það vantar auðkenni herbergis",invalid_format:"Vitlaust auðkenni : {0}"},outline:{invalid_parameters_number:"Hvert hnit í útlínum fyrir herbergi verður að innihalda 2 færibreytur"}},label:{x:{missing:"Merkimiði verður að innihalda x einingu"},y:{missing:"Merkimiði verður að innihalda y einingu"},text:{missing:'Merkimiði verður að innihalda "text" einingu'}},icon:{x:{missing:"Smámynd verður að innihalda x einingu"},y:{missing:"Smámynd verður að innihalda y einingu"},name:{missing:'Smámynd verður að innihalda "name" einingu'}}},service_call_schema:{missing:"Skema fyrir þjónustukall vantar",service:{missing:'Skema fyrir þjónustukall verður að innihalda "service"',invalid:"Röng þjónusta: {0}"}}}},invalid_entities:"Röng einindi:",invalid_calibration:"Röng kvörðun, athugaðu stillingarnar þínar"},Ta={status:{label:"Staða",value:{starting:"Ræsi","charger disconnected":"Hleðslutæki aftengt",idle:"Aðgerðarlaus","remote control active":"Fjarstýring virk",cleaning:"Að þrífa","returning home":"Á leiðinni heim","manual mode":"Handvirk stýring",charging:"Í hleðslu","charging problem":"Vandamál við hleðslu",paused:"Í bið","spot cleaning":"Hreinsa blett",error:"Villa","shutting down":"Slekk á",updating:"Uppfæri",docking:"Við hleðslustöð","going to target":"Fer á skotmark","zoned cleaning":"Þrífa svæði","segment cleaning":"Þrífa herbergi","emptying the bin":"Tæma ruslatunnu","charging complete":"Hleðslu lokið","device offline":"Tæki er ótengt"}},battery_level:{label:"Rafhlaða"},fan_speed:{label:"Viftuhraði",value:{silent:"Hljóðlátur",standard:"Venjulegur",medium:"Miðlungs",turbo:"Túrbó",auto:"Sjálfvirkt",gentle:"Þægilegur"}},sensor_dirty_left:{label:"Vegg og fallskynjarar eftir"},filter_left:{label:"Sía eftir"},main_brush_left:{label:"Aðalbursti eftir"},side_brush_left:{label:"Hliðarbursti eftir"},cleaning_count:{label:"Fjöldi þrifa"},cleaned_area:{label:"Svæði þrifið"},cleaning_time:{label:"Þriftími"},mop_left:{label:"Moppa eftir"}},Ra={vacuum_start:"Ræsa",vacuum_pause:"Gera hlé",vacuum_stop:"Stoppa",vacuum_return_to_base:"Tilbaka á stöð",vacuum_clean_spot:"Hreinsa blett",vacuum_locate:"Finna",vacuum_set_fan_speed:"Breyta viftuhraða"},ja={hour_shortcut:"k",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"mín"},$a={success:"Virkaði!",no_selection:"Ekkert val",failed:"Villa við þjónustukall"},Na={description:{text:"Sjónrænn ritill styður aðeins grunn stillingar. Fyrir ítarstillingar, notaðu YAML ham."},label:{name:"Titill (valkvætt)",entity:"Vacuum eining (nauðsynlegt)",camera:"Camera eining (nauðsynlegt)",vacuum_platform:"Vacuum platform (nauðsynlegt)",map_locked:"Læsa korti (valkvætt)",two_finger_pan:"Val með 2 fingrum (valkvætt)",map_only:"Map only (optional)"}},Ia={common:Pa,map_mode:Ca,validation:Ma,tile:Ta,icon:Ra,unit:ja,popups:$a,editor:Na},La={version:"Versione",invalid_configuration:"Configurazione non valida {0}",description:"Una card per controllare il tuo robot aspirapolvere",old_configuration:"Trovata una vecchia configurazione. Correggi la configurazione all'ultima possibile o crea una nuova card.",old_configuration_migration_link:"Guida Migrazione"},Oa={invalid:"Template non valido!",vacuum_goto:"Pin & Go",vacuum_goto_predefined:"Punti",vacuum_clean_segment:"Stanze",vacuum_clean_point:"Punto di pulizia",vacuum_clean_point_predefined:"Punti",vacuum_clean_zone:"Pulizia a Zone",vacuum_clean_zone_predefined:"Lista Zone",vacuum_follow_path:"Percorso"},Da={preset:{entity:{missing:"Proprietà Mancante: entity"},preset_name:{missing:"Proprietà Mancante: preset_name"},platform:{invalid:"Piattaforma aspirapolvere non valida: {0}"},map_source:{missing:"Proprietà Mancante: map_source",none_provided:"Inserire camera o immagine",ambiguous:"È consentita una sola sorgente della mappa"},calibration_source:{missing:"Proprietà Mancante: calibration_source",ambiguous:"È consentita una solo una sorgente di calibrazione",none_provided:"Nessuna fonte di calibrazione fornita",calibration_points:{invalid_number:"Esattamente 3 o 4 punti di calibrazione richiesti",missing_map:"Ogni punto di calibrazione deve contenere le coordinate della mappa",missing_vacuum:"Ciascun punto di calibrazione deve contenere le coordinate dell'aspirapolvere",missing_coordinate:"I punti di calibrazione della mappa e dell'aspirapolvere devono contenere sia le coordinate x che y"}},icons:{invalid:"Errore nella configurazione: icons",icon:{missing:"Ogni voce dell'elenco delle icone deve contenere la proprietà dell'icona"}},tiles:{invalid:"Errore nella configurazione: tiles",entity:{missing_outdated_translation:"Ogni voce dell'elenco 'tile' deve contenere una entity"},label:{missing:"Ogni voce dell'elenco 'tile' deve contenere una label"}},map_modes:{invalid:"Errore nella configurazione: map_modes",icon:{missing:"Icona della modalità mappa mancante"},name:{missing:"Nome della modalità mappa mancante"},template:{invalid:"Template non valido: {0}"},predefined_selections:{not_applicable:"Modalità {0} non supporta le selezioni predefinite",zones:{missing:"Configurazione zone mancante",invalid_parameters_number:"Ogni zona deve avere 4 parametri"},points:{position:{missing:"Configurazione punti mancante",invalid_parameters_number:"Ogni punto deve avere 2 parametri"}},rooms:{id:{missing:"ID stanza mancante",invalid_format:"ID stanza non valido: {0}"},outline:{invalid_parameters_number:"Ogni punto del contorno della stanza deve avere 2 parametri"}},label:{x:{missing:"Label deve avere la proprietà x"},y:{missing:"Label deve avere la proprietà y"},text:{missing:"Label deve avere la proprietà text"}},icon:{x:{missing:"Icon deve avere la proprietà x"},y:{missing:"Icon deve avere la proprietà y"},name:{missing:"Icon deve avere la proprietà name"}}},service_call_schema:{missing:"Schema della chiamata al servizio mancante",service:{missing:"La chiamata al servizio deve contenere un servizio",invalid:"Servizio non valido: {0}"}}}},invalid_entities:"Entità non valide:",invalid_calibration:"Calibrazione non valida, per favore controlla la configurazione"},Va={status:{label:"Stato",value:{starting:"Avvio","charger disconnected":"Caricabatterie scollegato",idle:"Riposo","remote control active":"Controllo remoto attivo",cleaning:"Pulizia","returning home":"Ritorno alla base","manual mode":"Modalità Manuale",charging:"Caricamento","charging problem":"Problema di ricarica",paused:"Pausa","spot cleaning":"Pulizia a punti",error:"Errore","shutting down":"Spegnimento",updating:"Aggiornamento in corso",docking:"In base","going to target":"Andando al punto","zoned cleaning":"Pulizia a zone","segment cleaning":"Pulizia segmenti","emptying the bin":"Svuotare il contenitore","charging complete":"Carica Completata","device offline":"Device offline"}},battery_level:{label:"Batteria"},fan_speed:{label:"Velocità Ventola",value:{silent:"Silenzioso",standard:"Standard",medium:"Media",turbo:"Turbo",auto:"Auto",gentle:"Delicato"}},sensor_dirty_left:{label:"Sensori"},filter_left:{label:"Filtro"},main_brush_left:{label:"Spazzola Principale"},side_brush_left:{label:"Spazzola laterale"},cleaning_count:{label:"Conteggio pulizia"},cleaned_area:{label:"Area pulita"},total_cleaned_area:{label:"Area totale pulita"},cleaning_time:{label:"Tempo di pulizia"},total_cleaning_time:{label:"Tempo totale di pulizia"},mop_left:{label:"Panno"},bin_full:{label:"Cestino pieno",value:{true:"Si",false:"No"}},bin_present:{label:"Cestino presente",value:{true:"Si",false:"No"}},water_volume:{label:"Volume dell'acqua"},mop_pad_humidity:{label:"Umidità del panno"}},Ua={vacuum_start:"Avvia",vacuum_pause:"Pausa",vacuum_stop:"Stop",vacuum_return_to_base:"Ritorna alla base",vacuum_clean_spot:"Pulizia spot",vacuum_locate:"Localizza",vacuum_set_fan_speed:"Cambia velocità ventola"},Ka={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Fa={success:"Confermato!",no_selection:"Nessuna Selezione",failed:"Chiamata al servizio fallita"},qa={description:{text:"Questo editor visivo supporta solo una configurazione di base. Per una configurazione più avanzata usa la modalità YAML."},label:{name:"Titolo (opzionale)",entity:"Entità Aspirapolvere (obbligatorio)",camera:"Entità camera (obbligatorio)",vacuum_platform:"Piattaforma aspirapolvere (obbligatorio)",map_locked:"Blocco mappa (opzionale)",two_finger_pan:"Zoom a due dita (opzionale)",map_only:"Map only (optional)",platforms_documentation:"Documentazione della piattaforma scelta ({0})",selection:"Selezione:",copy:"Copia",copied:"Copiato!",set_static_config:"Genera configurazione statica",config_set:"Configurazione impostata!\nApri l'editor di configurazione per modificarla.",config_set_failed:"Impossibile aggiornare la configurazione.",generate_rooms_config:"Genera configurazione delle stanze",copy_service_call:"Copia chiamata di servizio"},alerts:{set_static_config:"Dovresti utilizzare questa funzionalità solo se desideri regolare manualmente la configurazione generata automaticamente.\nContinuare?"}},Ha={common:La,map_mode:Oa,validation:Da,tile:Va,icon:Ua,unit:Ka,popups:Fa,editor:qa},Ga={version:"Versija",invalid_configuration:"Nederīga konfigurācija {0}",description:"Karte, ar kuras palīdzību jūs varat kontrolēt vakuumu, izmantojot karti",old_configuration:"Konstatēta veca konfigurācija. Pielāgojiet savu konfigurāciju jaunākajai shēmai vai izveidojiet jaunu karti no nulles.",old_configuration_migration_link:"Migrācijas ceļvedis"},Ba={invalid:"Nederīga veidne!",vacuum_goto:"Pin & Go",vacuum_goto_predefined:"Punkti",vacuum_clean_segment:"Istabas",vacuum_clean_point:"Tīrīšanas punkts",vacuum_clean_point_predefined:"Punkti",vacuum_clean_zone:"Zonas tīrīšana",vacuum_clean_zone_predefined:"Zonu saraksts",vacuum_follow_path:"Ceļš"},Za={preset:{entity:{missing:"Trūkst īpašības: entity"},preset_name:{missing:"Trūkst īpašības: preset_name"},platform:{invalid:"Nederīga vakuuma platforma: {0}"},map_source:{missing:"Trūkst īpašības: map_source",none_provided:"Nav nodrošināta ne kamera, ne attēls",ambiguous:"Atļauts tikai viens kartes avots"},calibration_source:{missing:"Trūkst īpašības: calibration_source",ambiguous:"Atļauts tikai viens kalibrēšanas avots",none_provided:"Nav nodrošināts kalibrēšanas avots",calibration_points:{invalid_number:"Nepieciešami tieši 3 vai 4 kalibrēšanas punkti",missing_map:"Katram kalibrēšanas punktam jāietver kartes koordinātas",missing_vacuum:"Katram kalibrēšanas punktam jāietver vakuuma koordinātas",missing_coordinate:"Kartes un vakuuma kalibrēšanas punktiem jāietver gan x, gan y koordinātas"}},icons:{invalid:"Konfigurācijas kļūda: ikonas",icon:{missing:"Katram ikonu saraksta ierakstam jāietver ikonas īpašība"}},tiles:{invalid:"Konfigurācijas kļūda: flīzes",entity:{missing:"Katram flīžu saraksta ierakstam jāietver entity vai iekšējais mainīgais"},label:{missing:"Katram flīžu saraksta ierakstam jāietver etiķete"}},map_modes:{invalid:"Konfigurācijas kļūda: kartes režīmi",icon:{missing:"Trūkst kartes režīma ikonas"},name:{missing:"Trūkst kartes režīma nosaukuma"},template:{invalid:"Nederīga veidne: {0}"},predefined_selections:{not_applicable:"Režīms {0} neatbalsta iepriekš definētas atlases",zones:{missing:"Trūkst zonu konfigurācijas",invalid_parameters_number:"Katrai zonai jābūt 4 parametriem"},points:{position:{missing:"Trūkst punktu konfigurācijas",invalid_parameters_number:"Katram punktam jābūt 2 parametriem"}},rooms:{id:{missing:"Trūkst istabas ID",invalid_format:"Nederīgs istabas ID: {0}"},outline:{invalid_parameters_number:"Katram istabas kontūras punktam jābūt 2 parametriem"}},label:{x:{missing:"Etiķetei jābūt x īpašībai"},y:{missing:"Etiķetei jābūt y īpašībai"},text:{missing:"Etiķetei jābūt tekstam"}},icon:{x:{missing:"Ikonai jābūt x īpašībai"},y:{missing:"Ikonai jābūt y īpašībai"},name:{missing:"Ikonai jābūt nosaukumam"}}},service_call_schema:{missing:"Trūkst pakalpojuma izsaukuma shēmas",service:{missing:"Pakalpojuma izsaukuma shēmai jāietver pakalpojums",invalid:"Nederīgs pakalpojums: {0}"}}}},invalid_entities:"Nederīgas vienības:",invalid_calibration:"Nederīga kalibrēšana, lūdzu, pārbaudiet savu konfigurāciju"},Ya={status:{label:"Statuss",value:{starting:"Sākums","charger disconnected":"Lādētājs atvienots",idle:"Gaida","remote control active":"Tālvadība aktīva",cleaning:"Tīrīšana","returning home":"Atgriežas mājās","manual mode":"Manuālais režīms",charging:"Uzlāde","charging problem":"Uzlādes problēma",paused:"Pauzēts","spot cleaning":"Vietas tīrīšana",error:"Kļūda","shutting down":"Izslēgšana",updating:"Atjaunināšana",docking:"Dokēšana","going to target":"Dodoties uz mērķi","zoned cleaning":"Zonu tīrīšana","segment cleaning":"Segmentu tīrīšana","emptying the bin":"Tvertnes iztukšošana","charging complete":"Uzlāde pabeigta","device offline":"Ierīce bezsaistē"}},battery_level:{label:"Akumulators"},fan_speed:{label:"Ventilatora ātrums",value:{silent:"Kluss",standard:"Standarts",medium:"Vidējs",turbo:"Turbo",auto:"Automātisks",gentle:"Maigs"}},sensor_dirty_left:{label:"Sensori pa kreisi"},filter_left:{label:"Filtrs pa kreisi"},main_brush_left:{label:"Galvenā birste pa kreisi"},side_brush_left:{label:"Sānu birste pa kreisi"},cleaning_count:{label:"Tīrīšanas skaits"},cleaned_area:{label:"Tīrītā platība"},total_cleaned_area:{label:"Kopējā tīrītā platība"},cleaning_time:{label:"Tīrīšanas laiks"},total_cleaning_time:{label:"Kopējais tīrīšanas laiks"},mop_left:{label:"Mops pa kreisi"},bin_full:{label:"Tvertne pilna",value:{true:"Jā",false:"Nē"}},bin_present:{label:"Tvertne klāt",value:{true:"Jā",false:"Nē"}},water_volume:{label:"Ūdens tilpums"},mop_pad_humidity:{label:"Mopa spilventiņa mitrums"}},Xa={vacuum_start:"Sākt",vacuum_pause:"Pauze",vacuum_stop:"Apturēt",vacuum_return_to_base:"Atgriezties bāzē",vacuum_clean_spot:"Tīrīt vietu",vacuum_locate:"Atrast",vacuum_set_fan_speed:"Mainīt ventilatora ātrumu"},Wa={hour_shortcut:"st",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Ja={success:"Veiksmīgi!",no_selection:"Nav izvēlēts",failed:"Neizdevās izsaukt pakalpojumu"},Qa={description:{text:"Šis vizuālais redaktors atbalsta tikai pamata konfigurāciju. Lai veiktu sarežģītāku iestatīšanu, izmantojiet YAML režīmu."},label:{name:"Nosaukums (pēc izvēles)",entity:"Vakuuma vienība (obligāti)",camera:"Kameras vienība (obligāti)",vacuum_platform:"Vakuuma platforma (obligāti)",map_locked:"Karte bloķēta (pēc izvēles)",two_finger_pan:"Divu pirkstu panoramēšana (pēc izvēles)",map_only:"Map only (optional)",platforms_documentation:"Izvēlētās platformas dokumentācija ({0})",selection:"Izvēle:",copy:"Kopēt",copied:"Nokopēts!",set_static_config:"Ģenerēt statisko konfigurāciju",config_set:"Konfigurācija iestatīta!\nAtveriet konfigurācijas redaktoru, lai to pielāgotu.",config_set_failed:"Neizdevās atjaunināt konfigurāciju.",generate_rooms_config:"Ģenerēt istabu konfigurāciju",copy_service_call:"Kopēt pakalpojuma izsaukumu"},alerts:{set_static_config:"Šo funkcionalitāti vajadzētu izmantot tikai tad, ja vēlaties manuāli pielāgot automātiski ģenerēto konfigurāciju.\nTurpināt?"}},ei={common:Ga,map_mode:Ba,validation:Za,tile:Ya,icon:Xa,unit:Wa,popups:Ja,editor:Qa},ti={version:"Versjon",invalid_configuration:"Ugyldig konfigurasjon {0}",description:"Et kort som lar deg kontrollere støvsugeren din",old_configuration:"Gammel konfigurasjon oppdaget. Rediger din konfigurasjon til nyeste skjema, eller lag et nytt kort.",old_configuration_migration_link:"Guide for migrering"},ai={invalid:"Ugyldig template!",vacuum_goto:"Klikk & Gå",vacuum_goto_predefined:"Punkter",vacuum_clean_segment:"Rom",vacuum_clean_point:"Rengjøringspunkt",vacuum_clean_point_predefined:"Punkter",vacuum_clean_zone:"Sonerengjøring",vacuum_clean_zone_predefined:"Soneliste",vacuum_follow_path:"Sti"},ii={preset:{entity:{missing:"Mangler egenskap: entity"},preset_name:{missing:"Mangler egenskap: preset_name"},platform:{invalid:"Ugyldig støvsugerplattform: {0}"},map_source:{missing:"Mangler egenskap: map_source",none_provided:"Ingen kamera eller bilder spesifisert",ambiguous:"Bare en kart-kilde er tillatt"},calibration_source:{missing:"Mangler egenskap: calibration_source",ambiguous:"Kun en kalibreringskilde tillatt",none_provided:"Ingen kalibreringskilde spesifisert",calibration_points:{invalid_number:"Eksakt 3 eller 4 kalibreringspunkter kreves",missing_map:"Hvert kalibreringspunkt må inneholde koordinater for kart",missing_vacuum:"Hvert kalibreringspunkt må inneholde koordinater for støvsuger",missing_coordinate:"Kalibreringspunkter for kart og støvsuger må inneholde både x og y koordinater"}},icons:{invalid:"Feil i konfigurasjon: icons",icon:{missing:"Hver post med icons må inneholde icon-egenskap"}},tiles:{invalid:"Feil i konfigurasjon: tiles",entity:{missing_outdated_translation:"Hver post med tiles må inneholde entity"},label:{missing:"Hver post med tiles må inneholde label"}},map_modes:{invalid:"Feil i konfigurasjon: map_modes",icon:{missing:"Ikon for map mode mangler"},name:{missing:"Navn for map mode mangler"},template:{invalid:"Ugyldig template: {0}"},predefined_selections:{not_applicable:"Modus {0} støtter ikke forhåndsdefinerte valg",zones:{missing:"Mangler sonens konfigurasjon",invalid_parameters_number:"Hver sone må ha 4 parametere"},points:{position:{missing:"Konfigurasjon av punktet mangler",invalid_parameters_number:"Hvert punkt må ha 2 parametere"}},rooms:{id:{missing:"Rommets id mangler",invalid_format:"Feil id på rom: {0}"},outline:{invalid_parameters_number:"Hvert punkt i romomrisset må ha 2 parametere"}},label:{x:{missing:"Label må ha egenskapen x"},y:{missing:"Label må ha egenskapen y"},text:{missing:"Label må ha egenskapen text"}},icon:{x:{missing:"Icon må ha egenskapen x"},y:{missing:"Icon må ha egenskapen y"},name:{missing:"Icon må ha egenskapen name"}}},service_call_schema:{missing:"Manglende service call schema",service:{missing:"Service call schema må inneholde service",invalid:"Ugyldig service: {0}"}}}},invalid_entities:"Ugyldige entiteter:",invalid_calibration:"Ugyldig kalibrering, vennligst se over din konfigurasjon"},ni={status:{label:"Status",value:{starting:"Starter","charger disconnected":"Lader frakoblet",idle:"Inaktiv","remote control active":"Fjernkontroll aktiv",cleaning:"Rengjøring","returning home":"På vei hjem","manual mode":"Manuell modus",charging:"Lader","charging problem":"Ladeproblem",paused:"Pause","spot cleaning":"Flekkrengjøring",error:"Feil","shutting down":"Slår av",updating:"Oppdaterer",docking:"Docking","going to target":"Går til destinasjon","zoned cleaning":"Sonerengjøring","segment cleaning":"Rengjøring av rom","emptying the bin":"Tømmer beholderen","charging complete":"Lading fullført","device offline":"Enhet offline"}},battery_level:{label:"Batteri"},fan_speed:{label:"Viftehastighet",value:{Silent:"Stille",Standard:"Standard",Medium:"Medium",Turbo:"Turbo",Auto:"Auto",Gentle:"Forsiktig"}},sensor_dirty_left:{label:"Sensorer igjen"},filter_left:{label:"Filter igjen"},main_brush_left:{label:"Hovedbørste igjen"},side_brush_left:{label:"Sidebørste igjen"},cleaning_count:{label:"Antall rengjøringer"},cleaned_area:{label:"Rengjort område"},cleaning_time:{label:"Rengjøringstid"},mop_left:{label:"Mopp igjen"}},oi={vacuum_start:"Start",vacuum_pause:"Pause",vacuum_stop:"Stopp",vacuum_return_to_base:"Gå tilbake til basen",vacuum_clean_spot:"Flekkrengjøring",vacuum_locate:"Lokaliser",vacuum_set_fan_speed:"Endre viftehastighet"},ri={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},si={success:"Suksess!",no_selection:"Ingen valg er gitt",failed:"Kunne ikke kalle tjenesten"},li={description:{text:"Denne visuelle editoren støtter bare en grunnleggende konfigurasjon. For mer avansert oppsett bruk YAML-modus."},label:{name:"Tittel (valgfritt)",entity:"Støvsuger-entitet (obligatorisk)",camera:"Kamera-entitet (obligatorisk)",vacuum_platform:"Støvsugerplattform (obligatorisk)",map_locked:"Låst kart (valgfritt)",two_finger_pan:"Panorering med to fingre (valgfritt)",map_only:"Map only (optional)"}},ci={common:ti,map_mode:ai,validation:ii,tile:ni,icon:oi,unit:ri,popups:si,editor:li},di={version:"Versie",invalid_configuration:"Ongeldige configuratie {0}",description:"Een kaart waarmee je jouw robotstofzuiger kunt bedienen.",old_configuration:"Oude configuratie gevonden. Pas je configuratie aan op basis van de nieuwe versie of maak een volledig nieuwe kaart.",old_configuration_migration_link:"Uitleg configuratie aanpassen"},ui={invalid:"Ongeldig sjabloon!",vacuum_goto:"Pin & Go",vacuum_goto_predefined:"Punten",vacuum_clean_segment:"Kamers",vacuum_clean_point:"Schoonmaakpunten",vacuum_clean_point_predefined:"Punten",vacuum_clean_zone:"Zone schoonmaak",vacuum_clean_zone_predefined:"Zonelijst",vacuum_follow_path:"Pad"},mi={preset:{entity:{missing:"Ontbrekende parameter: entity"},preset_name:{missing:"Ontbrekende parameter: preset_name"},platform:{invalid:"Ongeldig stofzuigerplatform: {0}"},map_source:{missing:"Ontbrekende parameter: map_source",none_provided:"Geen camera of afbeelding opgegeven",ambiguous:"Slechts één kaartbron toegestaan"},calibration_source:{missing:"Ontbrekende parameter: calibration_source",ambiguous:"Slechts één kalibratiebron toegestaan",none_provided:"Geen kalibratiebron opgegeven",calibration_points:{invalid_number:"Precies 3 of 4 kalibratiepunten vereist",missing_map:"Elk kalibratiepunt moet kaart-coördinaten bevatten",missing_vacuum:"Elk kalibratiepunt moet stofzuiger coördinaten bevatten",missing_coordinate:"Kalibratiepunten van kaart en stofzuiger moeten zowel een X- als Y-coördinaat bevatten"}},icons:{invalid:"Fout in configuratie: icons",icon:{missing:"Elk item in de lijst moet de eigenschap « icon » bevatten"}},tiles:{invalid:"Fout in configuratie: tiles",entity:{missing_outdated_translation:"Elk item in de lijst moet de eigenschap « entity » bevatten"},label:{missing:"Elk item in de lijst moet de eigenschap « label » bevatten"}},map_modes:{invalid:"Fout in configuratie: map_modes",icon:{missing:"Pictogram van kaartmodus ontbreekt"},name:{missing:"Naam van kaartmodus ontbreekt"},template:{invalid:"Ongeldig sjabloon: {0}"},predefined_selections:{not_applicable:"Modus {0} ondersteunt geen vooraf gedefinieerde selecties",zones:{missing:"Zone-configuratie ontbreekt",invalid_parameters_number:"Elke zone moet 4 coördinaten hebben"},points:{position:{missing:"Puntenconfiguratie ontbreekt",invalid_parameters_number:"Elk punt moet 2 coördinaten hebben"}},rooms:{id:{missing:"Kamer-id ontbreekt",invalid_format:"Ongeldige kamer-id: {0}"},outline:{invalid_parameters_number:"Elk punt van de kameromtrek moet 2 coördinaten hebben"}},label:{x:{missing:"Elk label moet de eigenschap « x » bevatten"},y:{missing:"Elk label moet de eigenschap « y » bevatten"},text:{missing:"Elk label moet de eigenschap « text » bevatten"}},icon:{x:{missing:"Elk pictogram moet de eigenschap « x » bevatten"},y:{missing:"Elk pictogram moet de eigenschap « y » bevatten"},name:{missing:"Elk pictogram moet de eigenschap « name » bevatten"}}},service_call_schema:{missing:"Serviceoproep schema",service:{missing:"Serviceoproep-schema moet een service bevatten",invalid:"Ongeldige service: {0}"}}}},invalid_entities:"Ongeldige entiteiten:",invalid_calibration:"Ongeldige kalibratie, controleer je configuratie"},pi={status:{label:"Status",value:{starting:"Starten","charger disconnected":"Lader niet aangesloten",idle:"Inactief","remote control active":"Afstandsbediening actief",cleaning:"Schoonmaken","returning home":"Terugkeren naar basisstation","manual mode":"Handmatige modus",charging:"Laden","charging problem":"Laadprobleem",paused:"Gepauzeerd","spot cleaning":"Spot schoonmaken",error:"Fout","shutting down":"Afsluiten",updating:"Updaten",docking:"Docking","going to target":"Onderweg naar doel","zoned cleaning":"Zone schoonmaken","segment cleaning":"Kamers schoonmaken","emptying the bin":"Opvangbak leegmaken","charging complete":"Opladen voltooid","device offline":"Apparaat offline"}},battery_level:{label:"Accupercentage"},fan_speed:{label:"Ventilatorsnelheid",value:{silent:"Stil",standard:"Standaard",medium:"Gemiddeld",turbo:"Turbo",auto:"Automatisch",gentle:"Zacht"}},sensor_dirty_left:{label:"Sensors"},filter_left:{label:"Filter"},main_brush_left:{label:"Hoofdborstel"},side_brush_left:{label:"Zijborstel"},cleaning_count:{label:"Schoonmaakteller"},cleaned_area:{label:"Oppervlakte"},total_cleaned_area:{label:"Totale schoongemaakte oppervlakte"},cleaning_time:{label:"Schoonmaaktijd"},total_cleaning_time:{label:"Totale schoonmaaktijd"},mop_left:{label:"Dweil"},bin_full:{label:"Afvalcontainer vol",value:{true:"Yes",false:"No"}},bin_present:{label:"Afvalcontainer aanwezig",value:{true:"Yes",false:"No"}},water_volume:{label:"Watervolume"},mop_pad_humidity:{label:"Dweildoek"}},gi={vacuum_start:"Start",vacuum_pause:"Pause",vacuum_stop:"Stop",vacuum_return_to_base:"Terug naar basisstation",vacuum_clean_spot:"Spot schoonmaak",vacuum_locate:"Lokaliseren",vacuum_set_fan_speed:"Ventilatorsnelheid aanpassen"},_i={hour_shortcut:"u",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},hi={success:"Succes!",no_selection:"Geen selectie opgegeven",failed:"Fout bij aanroepen service"},vi={description:{text:"Deze grafische editor ondersteunt slechts een basis-configuratie. Gebruik de YAML-modus voor een meer uitgebreide configuratie."},label:{name:"Titel (optioneel)",entity:"Stofzuigerentiteit (verplicht)",camera:"Camera-entiteit (verplicht)",vacuum_platform:"Stofzuigerplatform (verplicht)",map_locked:"Kaart vergrendelen (optioneel)",two_finger_pan:"Kaart verplaatsen met twee vingers (optioneel)",map_only:"Map only (optional)",platforms_documentation:"Documentatie van gekozen stofzuigerplatform ({0})",selection:"Selectie:",copy:"Kopiëren",copied:"Gekopieerd!",set_static_config:"Statische configuratie aanmaken",config_set:"Configuratie ingesteld!\nOpen de configuratie-editor om deze aan te passen.",config_set_failed:"Bijwerken van de configuratie mislukt",generate_rooms_config:"Kamer-configuratie aanmaken",copy_service_call:"Service Call kopiëren"},alerts:{set_static_config:"Gebruik deze functionaliteit alleen als je de gegenereerde configuratie nog handmatig wil aanpassen.\nDoorgaan?"}},fi={common:di,map_mode:ui,validation:mi,tile:pi,icon:gi,unit:_i,popups:hi,editor:vi},bi={version:"Wersja",invalid_configuration:"Nieprawidłowa konfiguracja {0}",description:"Karta pozwalająca na kontrolowanie odkurzacza przy użyciu mapy",old_configuration:"Wykryto starą wersję konfiguracji. Dostosuj kartę do najnowszej wersji, albo utwórz ją od nowa.",old_configuration_migration_link:"Przewodnik po migracji"},yi={invalid:"Nieprawidłowa wartość template",vacuum_goto:"Idź do punktu",vacuum_goto_predefined:"Zapisane punkty",vacuum_clean_segment:"Pokoje",vacuum_clean_point:"Sprzątanie punktowe",vacuum_clean_point_predefined:"Zapisane punkty",vacuum_clean_zone:"Sprzątanie strefowe",vacuum_clean_zone_predefined:"Zapisane strefy",vacuum_follow_path:"Ścieżka"},ki={preset:{entity:{missing:"Brakujący parametr: entity"},preset_name:{missing:"Brakujący parametr: preset_name"},platform:{invalid:"Nieprawidłowa platforma odkurzacza: {0}"},map_source:{missing:"Brakujący parametr: map_source",none_provided:"Nie podano źródła mapy",ambiguous:"Można podać tylko jedno źródło mapy"},calibration_source:{missing:"Brakujący parametr: calibration_source",ambiguous:"Można podać tylko jedno źródło kalibracji",none_provided:"Nie podano źródła kalibracji",calibration_points:{invalid_number:"Wymagane 3 bądź 4 punkty kalibracyjne",missing_map:"Każdy punkt kalibracyjny musi posiadać współrzędne na mapie",missing_vacuum:"Każdy punkt kalibracyjny musi posiadać współrzędne w układzie odkurzacza",missing_coordinate:"Każdy punkt kalibracyjny musi mieć współrzędne x i y"}},icons:{invalid:"Błąd w konfiguracji: icons",icon:{missing:'Każda pozycja na liście ikon musi posiadać parametr "icon"'}},tiles:{invalid:"Błąd w konfiguracji: tiles",entity:{missing:'Każda pozycja na liście kafelków musi posiadać parametr "entity" albo "internal_variable"'},label:{missing:'Każda pozycja na liście kafelków musi posiadać parametr "label"'}},map_modes:{invalid:"Błąd w konfiguracji: map_modes",icon:{missing:"Brakująca ikona szablonu trybu mapy"},name:{missing:"Brakująca nazwa szablonu trybu mapy"},template:{invalid:"Nieprawidłowy szablon trybu mapy: {0}"},predefined_selections:{not_applicable:"Szablon {0} nie wspiera zapisywania zaznaczeń",zones:{missing:"Brakująca lista zapisanych stref",invalid_parameters_number:"Każda zapisana strefa musi posiadać 4 współrzędne"},points:{position:{missing:"Brakująca lista zapisanych punktów",invalid_parameters_number:"Każdy zapisany punkt musi posiadać 2 współrzędne"}},rooms:{id:{missing:"Brakujący identyfikator pokoju",invalid_format:"Nieprawidłowy identyfikator pokoju: {0}"},outline:{invalid_parameters_number:"Każdy punkt obrysu pokoju musi posiadać 2 współrzędne"}},label:{x:{missing:"Każda etykieta musi posiadać współrzędną x"},y:{missing:"Każda etykieta musi posiadać współrzędną y"},text:{missing:"Każda etykieta musi posiadać tekst"}},icon:{x:{missing:"Każda ikona musi posiadać współrzędną x"},y:{missing:"Każda ikona musi posiadać współrzędną y"},name:{missing:'Każda ikona musi posiadać parametr "name"'}}},service_call_schema:{missing:"Brakujący schemat wywołania usługi",service:{missing:"Każdy schemat usługi musi posiadać podaną nazwę usługi  ",invalid:"Nieprawidłowa usługa: {0}"}}}},invalid_entities:"Nieprawidłowe encje:",invalid_calibration:"Nieprawidłowa kalibracja, sprawdź konfigurację"},xi={status:{label:"Status",value:{starting:"Uruchamianie","charger disconnected":"Ładowarka odłączona",idle:"Nieaktywny","remote control active":"Zdalne sterowanie",cleaning:"Sprzątanie","returning home":"Powrót do stacji","manual mode":"Tryb manualny",charging:"Ładowanie","charging problem":"Problem z ładowaniem",paused:"Wstrzymany","spot cleaning":"Sprzątanie punktowe",error:"Błąd","shutting down":"Wyłączanie",updating:"Aktualizowanie",docking:"Dokowanie","going to target":"W drodze do celu","zoned cleaning":"Sprzątanie strefowe","segment cleaning":"Sprzątanie pokoju","emptying the bin":"Opróżnianie pojemnika","charging complete":"Ładowanie zakończone","device offline":"Offline"}},battery_level:{label:"Bateria"},fan_speed:{label:"Wentylator",value:{silent:"Cichy",standard:"Normalny",medium:"Średni",turbo:"Turbo",auto:"Automatyczny",gentle:"Delikatny"}},sensor_dirty_left:{label:"Sensory"},filter_left:{label:"Filtr"},main_brush_left:{label:"Główna szczotka"},side_brush_left:{label:"Boczna szczotka"},cleaning_count:{label:"Licznik sprzątań"},cleaned_area:{label:"Powierzchnia"},total_cleaned_area:{label:"Całkowita powierzchnia"},cleaning_time:{label:"Czas sprzątania"},total_cleaning_time:{label:"Całkowity czas sprzątania"},mop_left:{label:"Mop"},bin_full:{label:"Pojemnik pełny",value:{true:"Tak",false:"Nie"}},bin_present:{label:"Pojemnik włożony",value:{true:"Tak",false:"Nie"}},water_volume:{label:"Poziom wody"},mop_pad_humidity:{label:"Wilgotność mopa"}},zi={vacuum_start:"Uruchom",vacuum_pause:"Wstrzymaj",vacuum_stop:"Zatrzymaj",vacuum_return_to_base:"Wróć do stacji dokującej",vacuum_clean_spot:"Wyczyść miejsce",vacuum_locate:"Zlokalizuj",vacuum_set_fan_speed:"Zmień prędkość wentylatora"},wi={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Ai={success:"Usługa wywołana!",no_selection:"Nie wybrano zaznaczenia",failed:"Błąd wywołania usługi"},Ei={description:{text:"Ten edytor wizualny pozwala tylko na podstawową konfigurację. Bardziej zaawansowane funkcje są dostępne jedynie w trybie YAML."},label:{name:"Tytuł (opcjonalny)",entity:"Encja odkurzacza (wymagana)",camera:"Kamera z mapą (wymagana)",vacuum_platform:"Platforma integracji odkurzacza (wymagana)",map_locked:"Blokada mapy (opcjonalna)",two_finger_pan:"Przesuwanie mapy dwoma palcami (opcjonalne)",map_only:"Map only (optional)",platforms_documentation:"Dokumentacja wybranej platformy ({0})",selection:"Zaznaczenie:",copy:"Kopiuj",copied:"Skopiowano!",set_static_config:"Wygeneruj statyczną konfigurację",config_set:"Ustawiono konfigurację!\nOtwórz edytor YAML w celu dostosowania.",config_set_failed:"Błąd aktualizacji konfiguracji.",generate_rooms_config:"Wygeneruj konfigurację pokoi",copy_service_call:"Skopiuj wywołanie usługi"},alerts:{set_static_config:"Ten przycisk powinien zostać użyty tylko wtedy, jeśli chcesz ręcznie dostosować automatycznie wygenerowaną konfigurację.\nKontynuować?"}},Si={common:bi,map_mode:yi,validation:ki,tile:xi,icon:zi,unit:wi,popups:Ai,editor:Ei},Pi={version:"Versão",invalid_configuration:"Configuração inválida {0}",description:"Um cartão que lhe permite controlar o seu aspirador",old_configuration:"Configuração antiga detectada. Ajuste sua configuração para a versão mais recente ou crie um novo cartão do zero.",old_configuration_migration_link:"Guia de migração"},Ci={invalid:"Template inválido!",vacuum_goto:"Clicar & Ir",vacuum_goto_predefined:"Pontos",vacuum_clean_segment:"Quartos",vacuum_clean_point:"Local de limpeza",vacuum_clean_point_predefined:"Pontos",vacuum_clean_zone:"Limpeza de zona",vacuum_clean_zone_predefined:"Lista de zonas",vacuum_follow_path:"Caminho"},Mi={preset:{entity:{missing:"Propriedade em falta: entidade"},preset_name:{missing:"Propriedade em falta: preset_name"},platform:{invalid:"Plataforma de aspirador inválida: {0}"},map_source:{missing:"Propriedade em falta: map_source",none_provided:"Nenhuma câmera nem imagem fornecida",ambiguous:"Apenas uma fonte de mapa permitida"},calibration_source:{missing:"Propriedade em falta: calibration_source",ambiguous:"Apenas uma fonte de calibração permitida",none_provided:"Nenhuma fonte de calibração fornecida",calibration_points:{invalid_number:"São necessários, exactamente, 3 ou 4 pontos de calibração",missing_map:"Cada ponto de calibração deve conter coordenadas do mapa",missing_vacuum:"Cada ponto de calibração deve conter coordenadas do aspirador",missing_coordinate:"Os pontos de calibração do mapa e do aspirador devem conter as coordenadas x e y"}},icons:{invalid:"Erro na configuração: icones",icon:{missing:"Cada entrada na lista de ícones deve conter a propriedade do ícone"}},tiles:{invalid:"Erro na configuração: tiles",entity:{missing:"Cada entrada da lista deve conter uma entidade ou variável interna"},label:{missing:"Cada entrada da lista deve conter uma etiqueta"}},map_modes:{invalid:"Erro na configuração: map_modes",icon:{missing:"Falta o ícone do modo de mapa"},name:{missing:"Falta o nome do modo de mapa"},template:{invalid:"Template inválido: {0}"},predefined_selections:{not_applicable:"O modo {0} não oferece suporte a seleções predefinidas",zones:{missing:"Configuração de zonas em falta",invalid_parameters_number:"Cada zona deve ter 4 parâmetros"},points:{position:{missing:"Configuração de locais em falta",invalid_parameters_number:"Cada local deve ter 2 parâmetros"}},rooms:{id:{missing:"Identificação do quarto em falta",invalid_format:"Id do quarto inválido: {0}"},outline:{invalid_parameters_number:"Cada local do limite exterior do quarto deve ter 2 parâmetros"}},label:{x:{missing:"A etiqueta deve ter a propriedade x"},y:{missing:"A etiqueta deve ter a propriedade y"},text:{missing:"A etiqueta deve ter um texto x"}},icon:{x:{missing:"O ícone deve ter a propriedade x"},y:{missing:"O ícone deve ter a propriedade y"},name:{missing:"O ícone deve ter um nome"}}},service_call_schema:{missing:"Falta a chamada de serviço",service:{missing:"A chamada de serviço deve conter o serviço",invalid:"serviço inválido: {0}"}}}},invalid_entities:"Entidades inválidas:",invalid_calibration:"Calibração inválida, verifique sua configuração"},Ti={status:{label:"Estado",value:{starting:"A iniciar","charger disconnected":"Carregador desligado",idle:"Em espera","remote control active":"Controlo remoto activo",cleaning:"A limpar","returning home":"A voltar á base","manual mode":"Modo manual",charging:"A carregar","charging problem":"Problema de carregamento",paused:"Em pausa","spot cleaning":"Limpeza de local",error:"Erro","shutting down":"A desligar",updating:"A actualizar",docking:"A atracar","going to target":"A caminho do alvo","zoned cleaning":"Limpeza de zona","segment cleaning":"Limpeza de segmento","emptying the bin":"A esvaziar o depósito","charging complete":"Carregamento completo","device offline":"Dispositivo offline"}},battery_level:{label:"Bateria"},fan_speed:{label:"Velocidade da ventoinha",value:{silent:"Silenciosa",standard:"Normal",medium:"Média",turbo:"Turbo",auto:"Automática",gentle:"Gentil"}},sensor_dirty_left:{label:"Sensores"},filter_left:{label:"Filtro"},main_brush_left:{label:"Escova principal"},side_brush_left:{label:"Escova lateral"},cleaning_count:{label:"Contagem de limpezas"},cleaned_area:{label:"Área limpa"},total_cleaned_area:{label:"Área total limpa"},cleaning_time:{label:"Tempo de limpeza"},total_cleaning_time:{label:"Tempo total de limpeza"},mop_left:{label:"Mopa"},bin_full:{label:"Depósito cheio",value:{true:"Sim",false:"Não"}},bin_present:{label:"Depósito presente",value:{true:"Sim",false:"Não"}},water_volume:{label:"Volume de Água"},mop_pad_humidity:{label:"Pano da mopa"}},Ri={vacuum_start:"Iniciar",vacuum_pause:"Pausar",vacuum_stop:"Parar",vacuum_return_to_base:"Voltar à base",vacuum_clean_spot:"Limpar local",vacuum_locate:"Localizar",vacuum_set_fan_speed:"Mudar velocidade da ventoinha"},ji={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},$i={success:"Sucesso!",no_selection:"Nenhuma seleção fornecida",failed:"Falha ao chamar o serviço"},Ni={description:{text:"O editor visual suporta apenas uma configuração básica. Para configuração avançada use o modo YAML."},label:{name:"Título (opcional)",entity:"Entidade de aspirador (necessária)",camera:"Entidade de camera (necessária)",vacuum_platform:"Plataforma dp aspirador (necessária)",map_locked:"Mapa trancado (opcional)",two_finger_pan:"Deslocamento com 2 dedos (opcional)",map_only:"Map only (optional)",platforms_documentation:"Documentação da plataforma escolhida ({0})",selection:"Selecção:",copy:"Copiar",copied:"Copiado!",set_static_config:"Gerar configuração estática",config_set:"Definição de configuração set!\nAbrir o editor de configuração par ajustar.",config_set_failed:"Falha ao actualizar a configuração.",generate_rooms_config:"Gerar configuração de quartos",copy_service_call:"Copiar a chamada de serviço"},alerts:{set_static_config:"Só deve usar esta funcionalidade se quiser ajustar manualmente as configurações geradas automaticamente.\nContinuar?"}},Ii={common:Pi,map_mode:Ci,validation:Mi,tile:Ti,icon:Ri,unit:ji,popups:$i,editor:Ni},Li={version:"Versão",invalid_configuration:"configuração inválida {0}",description:"Um cartão que permite que você controlar seu aspirador",old_configuration:"Configuração antiga detectada. Ajuste sua configuração para a versão mais recente ou crie um novo cartão do zero.",old_configuration_migration_link:"Guia de migração"},Oi={invalid:"template inválido!",vacuum_goto:"Click & vai",vacuum_goto_predefined:"Local",vacuum_clean_segment:"Quartos",vacuum_clean_zone:"Limpar zona",vacuum_clean_zone_predefined:"Lista de zonas",vacuum_follow_path:"Seguir caminho"},Di={preset:{entity:{missing:"Propriedade ausente: entidade"},preset_name:{missing:"Propriedade ausente: preset_name"},platform:{invalid:"Plataforma de aspirador inválida: {0}"},map_source:{missing:"Propriedade ausente: map_source",none_provided:"Nenhuma câmera nem imagem fornecida",ambiguous:"Apenas uma fonte de mapa permitida"},calibration_source:{missing:"Propriedade ausente: calibration_source",ambiguous:"Apenas uma fonte de calibração permitida",none_provided:"Nenhuma fonte de calibração fornecida",calibration_points:{invalid_number:"Exatamente 3 ou 4 pontos de calibração são necessários",missing_map:"Cada ponto de calibração deve conter coordenadas do mapa",missing_vacuum:"Cada ponto de calibração deve conter coordenadas do aspirador",missing_coordinate:"Os pontos de calibração do mapa e do aspirador devem conter as coordenadas x e y"}},icons:{invalid:"Erro na configuração: icones",icon:{missing:"Cada entrada na lista de ícones deve conter a propriedade do ícone"}},tiles:{invalid:"Erro na configuração: tiles",entity:{missing_outdated_translation:"Cada entrada da lista de tiles deve conter entidade"},label:{missing:"Cada entrada da lista de tiles deve conter label"}},map_modes:{invalid:"Erro na configuração: map_modes",icon:{missing:"Falta o ícone no modo de mapa"},name:{missing:"Falta o nome no modo de mapa"},template:{invalid:"Template inválido: {0}"},predefined_selections:{not_applicable:"O modo {0} não oferece suporte a seleções predefinidas",zones:{missing:"Falta a Configuração de zonas",invalid_parameters_number:"Cada zona deve ter 4 parâmetros"},points:{position:{missing:"Falta a configuração do local",invalid_parameters_number:"Cada local deve ter 2 parâmetros"}},rooms:{id:{missing:"Falta o id do quarto",invalid_format:"Id inválido do quarto: {0}"},outline:{invalid_parameters_number:"Cada local da borda do quarto deve ter 2 parâmetros"}},label:{x:{missing:"A label deve ter a propriedade x"},y:{missing:"A label deve ter a propriedade y"},text:{missing:"A label deve ter um texto"}},icon:{x:{missing:"O ícone deve ter a propriedade x"},y:{missing:"O ícone deve ter a propriedade y"},name:{missing:"O ícone deve ter um nome"}}},service_call_schema:{missing:"Falta o call service",service:{missing:"O call service deve conter o serviço",invalid:"serviço inválido: {0}"}}}},invalid_entities:"entidades inválidas:",invalid_calibration:"Calibração inválida, verifique sua configuração"},Vi={status:{label:"Status"},battery_level:{label:"Bateria"},fan_speed:{label:"Velocidade"},sensor_dirty_left:{label:"Sensores"},filter_left:{label:"Filtro"},main_brush_left:{label:"Escova principal"},side_brush_left:{label:"Escova lateral"},cleaning_count:{label:"Contagem de limpezas"},cleaned_area:{label:"Área limpa"},cleaning_time:{label:"Tempo de limpeza"}},Ui={vacuum_start:"Começar",vacuum_pause:"Pausar",vacuum_stop:"Parar",vacuum_return_to_base:"Voltar para a base",vacuum_clean_spot:"Limpar local",vacuum_locate:"Localizar",vacuum_set_fan_speed:"Mudar velocidade"},Ki={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Fi={success:"Successo!",no_selection:"Nenhuma seleção fornecida",failed:"Falha em chamar o serviço"},qi={description:{text:"Este editor suporta apenas uma configuração básica. Para um setup avancado use o YAML mode."},label:{name:"Título (opicional)",entity:"Entidade do aspirador (Obrigatório)",camera:"Entidade da camera (Obrigatório)",vacuum_platform:"Plataforma do aspirador (Obrigatório)",map_locked:"Mapa travado (Opicional)",two_finger_pan:"Movimente com dois dedos (Opicional)",map_only:"Map only (optional)"}},Hi={common:Li,map_mode:Oi,validation:Di,tile:Vi,icon:Ui,unit:Ki,popups:Fi,editor:qi},Gi={version:"Versiune",invalid_configuration:"Configurație invalidă {0}",description:"Un card care vă lasă să vă configurați aspiratorul",old_configuration:"Configurație veche detectată. Modificați fisierul de configurare la ultima versiune sau creați un nou card de la inceput.",old_configuration_migration_link:"Ghid de migrare"},Bi={invalid:"Template invalid!",vacuum_goto:"Punct și Mergi",vacuum_goto_predefined:"Puncte",vacuum_clean_segment:"Camere",vacuum_clean_point:"Punct de curățare",vacuum_clean_point_predefined:"Puncte predefinite",vacuum_clean_zone:"Zonă de curățare",vacuum_clean_zone_predefined:"Listă zone",vacuum_follow_path:"Cale"},Zi={preset:{entity:{missing:"Proprietate lipsă: entity"},preset_name:{missing:"Proprietate lipsă: preset_name"},platform:{invalid:"Invalid vacuum platform: {0}"},map_source:{missing:"Missing property: map_source",none_provided:"No camera neither image provided",ambiguous:"Only one map source allowed"},calibration_source:{missing:"Missing property: calibration_source",ambiguous:"Only one calibration source allowed",none_provided:"No calibration source provided",calibration_points:{invalid_number:"Exactly 3 or 4 calibration points required",missing_map:"Each calibration point must contain map coordinates",missing_vacuum:"Each calibration point must contain vacuum coordinates",missing_coordinate:"Map and vacuum calibration points must contain both x and y coordinate"}},icons:{invalid:"Eroare în configurare: icons",icon:{missing:"Fiecare intrare din lista de pictograme trebuie să conțină proprietatea pictogramei"}},tiles:{invalid:"Eroare în configurare: tiles",entity:{missing:"Each entry of tiles list must contain entity or internal variable"},label:{missing:"Fiecare intrare a listei de plăci trebuie să conțină o etichetă"}},map_modes:{invalid:"Eroare în configurare: map_modes",icon:{missing:"Lipsește pictograma modului hartă"},name:{missing:"Lipsește numele modului hartă"},template:{invalid:"Template invalid: {0}"},predefined_selections:{not_applicable:"Modul {0} nu suportă selecțiile predefinite",zones:{missing:"Lipsă zone în configurație",invalid_parameters_number:"Fiecare zonă trebuie să aibă 4 parametri"},points:{position:{missing:"Lipsă puncte în configurație",invalid_parameters_number:"Fiecare punct trebuie să aibă 2 parametri"}},rooms:{id:{missing:"Lipsă id cameră",invalid_format:"Id cameră invalid: {0}"},outline:{invalid_parameters_number:"Fiecare punct al conturului camerei trebuie să aibă 2 parametri"}},label:{x:{missing:"Eticheta trebuie să aibă proprietatea x"},y:{missing:"Eticheta trebuie să aibă proprietatea y"},text:{missing:"Eticheta trebuie să aibă proprietatea text"}},icon:{x:{missing:"Pictograma trebuie să aibă proprietatea x"},y:{missing:"Pictograma trebuie să aibă proprietatea y"},name:{missing:"Pictograma trebuie să aibă proprietatea nume"}}},service_call_schema:{missing:"Lipsește schema de apel de service",service:{missing:"Schema de apel de service trebuie să conțină serviciu",invalid:"Serviciu invalid: {0}"}}}},invalid_entities:"Entități invalide:",invalid_calibration:"Calibrare nevalidă, vă rugăm să vă verificați configurația"},Yi={status:{label:"Stare",value:{starting:"Pornire","charger disconnected":"Încărcătorul a fost deconectat",idle:"Inactiv","remote control active":"Telecomanda activa",cleaning:"Curățare","returning home":"Întoarcere acasă","manual mode":"Mod manual",charging:"Se încarcă","charging problem":"Probleme de încărcare",paused:"În pauză","spot cleaning":"Curățarea petelor",error:"Eroare","shutting down":"Se închide",updating:"Se updatează",docking:"Andocare","going to target":"Mergând la țintă","zoned cleaning":"Curățare zonă","segment cleaning":"Curățare segment","emptying the bin":"Golirea coșului de gunoi","charging complete":"Încarcare completă","device offline":"Dispozitiv offline"}},battery_level:{label:"Baterie"},fan_speed:{label:"Viteza ventilatorului",value:{silent:"Tăcut",standard:"Standard",medium:"Mediu",turbo:"Turbo",auto:"Auto",gentle:"Blând"}},sensor_dirty_left:{label:"Timp rămas senzori"},filter_left:{label:"Timp rămas filtru"},main_brush_left:{label:"Timp rămas peria principală"},side_brush_left:{label:"Timp rămas peria laterală"},cleaning_count:{label:"Număr de curățări"},cleaned_area:{label:"Zonă curățată"},cleaning_time:{label:"Timp de curățare"},mop_left:{label:"Timp rămas mop"},bin_full:{label:"Coș de gunoi plin",value:{true:"Da",false:"Nu"}},bin_present:{label:"Coș de gunoi prezent",value:{true:"Da",false:"Nu"}}},Xi={vacuum_start:"Start",vacuum_pause:"Pauză",vacuum_stop:"Stop",vacuum_return_to_base:"Întoarceți-vă la bază",vacuum_clean_spot:"Curățare pată",vacuum_locate:"Localizați",vacuum_set_fan_speed:"Schimbă viteza ventilatorului"},Wi={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},Ji={success:"Succes!",no_selection:"Nu este oferită nicio selecție",failed:"Nu s-a putut apela serviciul"},Qi={description:{text:"Acest editor vizual acceptă doar o configurație de bază. Pentru o configurare mai avansată, utilizați modul YAML."},label:{name:"Titlu (opțional)",entity:"Entitate aspirator (necesar)",camera:"Entitate camera (necesar)",vacuum_platform:"Platformă aspirator (necesar)",map_locked:"Hartă blocată (opțional)",two_finger_pan:"Mișcare hartă cu două degete (opțional)",map_only:"Map only (optional)",platforms_documentation:"Documentația platformei alese ({0})",selection:"Selecție:",copy:"Copiază",copied:"Copiat!",set_static_config:"Generează config static",config_set:"Configurare setată!\nDeschide editorul de configurare pentru a-l ajusta.",config_set_failed:"Nu s-a putut actualiza configurația.",generate_rooms_config:"Generați configurația camerelor",copy_service_call:"Copiere apel de serviciu"}},en={common:Gi,map_mode:Bi,validation:Zi,tile:Yi,icon:Xi,unit:Wi,popups:Ji,editor:Qi},tn={version:"Версия",invalid_configuration:"Неверная конфигурация {0}",description:"Карточка, позволяющая управлять вашим пылесосом",old_configuration:"Обнаружена устаревшая конфигурация. Приведите вашу конфигурацию в соответствие с новой версией, или создайте новую карточку с нуля.",old_configuration_migration_link:"Руководство по переходу с предыдущих версий."},an={invalid:"Неверный шаблон!",vacuum_goto:"Точка назначения",vacuum_goto_predefined:"Предустановленные точки",vacuum_clean_segment:"Комнаты",vacuum_clean_point:"Уборка точки",vacuum_clean_point_predefined:"Список точек",vacuum_clean_zone:"Уборка зоны",vacuum_clean_zone_predefined:"Список зон",vacuum_follow_path:"Путь"},nn={preset:{entity:{missing:"Не указано свойство: entity"},preset_name:{missing:"Не указано свойство: preset_name"},platform:{invalid:"Неверная платформа: {0}"},map_source:{missing:"Не указано свойство: map_source",none_provided:"Не предоставлена ни камера ни изображение",ambiguous:"Допустим только один источник для карты"},calibration_source:{missing:"Не указано свойство: calibration_source",ambiguous:"Допустим только один источник для калибровки",none_provided:"Не предоставлен источник калибровки",calibration_points:{invalid_number:"Для калибровки требуется 3 или 4 точки",missing_map:"Каждая точка калибровки должна содержать координаты карты",missing_vacuum:"Каждая точка калибровки должна содержать координаты пылесоса",missing_coordinate:"Калибровочные точки карты и пылесоса должны содержать как x так и y координаты"}},icons:{invalid:"Ошибка в конфигурации: icons",icon:{missing:"Каждое вхождение в списке иконок должен содержать icon property"}},tiles:{invalid:"Ошибка в конфигурации: tiles",entity:{missing_outdated_translation:"Каждое вхождение в списке плиток должно содержать entity"},label:{missing:"Каждое вхождение в списке плиток должно содержать label"}},map_modes:{invalid:"Ошибка в конфигурации: map_modes",icon:{missing:"Не указана иконка для влажной уборки"},name:{missing:"Не указано имя для влажной уборки"},template:{invalid:"Неверный шаблон: {0}"},predefined_selections:{not_applicable:"Режим {0} не поддерживает предустановленые элементы",zones:{missing:"Не указана конфигурация зоны",invalid_parameters_number:"Каждая зона должна содержать 4 параметра"},points:{position:{missing:"Не указана конфигурация для точек",invalid_parameters_number:"Каждая точка должна содержать 2 параметра"}},rooms:{id:{missing:"Не указан id комнаты",invalid_format:"Некорректный id комнаты: {0}"},outline:{invalid_parameters_number:"Каждая точка контура комнаты должна содержать 2 параметра"}},label:{x:{missing:"Ярлык должен содержать свойство x"},y:{missing:"Ярлык должен содержать свойство y"},text:{missing:"Ярлык должен содержать свойство text"}},icon:{x:{missing:"Иконка должна содержать свойство x"},y:{missing:"Иконка должна содержать свойство y"},name:{missing:"Иконка должна содержать свойство name"}}},service_call_schema:{missing:"Отсутствует схема вызова службы",service:{missing:"Схема вызова службы должна содержать service",invalid:"Некорректная служба: {0}"}}}},invalid_entities:"Некорректные сущности:",invalid_calibration:"Некорректная калибровка, проверьте вашу конфигурацию"},on={status:{label:"Статус",value:{starting:"Начало уборки","charger disconnected":"Зарядное устройство отключено",idle:"Ожидание","remote control active":"Включено управление через пульт",cleaning:"Уборка","returning home":"Возвращение на базу","manual mode":"Ручной режим",charging:"Зарядка","charging problem":"Проблема с зарядкой",paused:"Пауза","spot cleaning":"Уборка точки",error:"Ошибка","shutting down":"Выключение",updating:"Обновление",docking:"Остановка у базы","going to target":"Направление до точки","zoned cleaning":"Уборка зоны","segment cleaning":"Уборка","emptying the bin":"Очистка бака","charging complete":"Зарядка завершена","device offline":"Устройство не в сети"}},battery_level:{label:"Уровень заряда"},fan_speed:{label:"Мощность всасывания",value:{silent:"Тихий",standard:"Стандарт",medium:"Средний",turbo:"Турбо",auto:"Авто",gentle:"Слабый"}},sensor_dirty_left:{label:"Уровень загрязнения датчиков"},filter_left:{label:"Ресурс фильтра"},main_brush_left:{label:"Ресурс основной щётки"},side_brush_left:{label:"Ресурс боковой щётки"},cleaning_count:{label:"Число уборок"},cleaned_area:{label:"Площадь уборки"},total_cleaned_area:{label:"Общая убранная площадь"},cleaning_time:{label:"Время уборки"},total_cleaning_time:{label:"Общее время уборки"},mop_left:{label:"Ресурс тряпки"},bin_full:{label:"Контейнер полон",value:{true:"Да",false:"Нет"}},bin_present:{label:"Контейнер присутствует",value:{true:"Да",false:"Нет"}},water_volume:{label:"Уровень воды"},mop_pad_humidity:{label:"Тряпка"}},rn={vacuum_start:"Старт",vacuum_pause:"Пауза",vacuum_stop:"Стоп",vacuum_return_to_base:"Вернуть к базе",vacuum_clean_spot:"Убрать точку",vacuum_locate:"Обнаружить",vacuum_set_fan_speed:"Изменить мощность всасывания"},sn={hour_shortcut:"ч",meter_shortcut:"м",meter_squared_shortcut:"м²",minute_shortcut:"мин"},ln={success:"Успех!",no_selection:"Ничего не выбрано",failed:"Не удалось вызвать службу"},cn={description:{text:"Данный редактор поддерживает только базовую конфигурацию. Для более тонкой настройки, используйте YAML-мод."},label:{name:"Заголовок (опционально)",entity:"Сущность пылесоса (обязательно)",camera:"Сущность камеры (обязательно)",vacuum_platform:"Платформа пылесоса (обязательно)",map_locked:"Блокировка карты (опционально)",two_finger_pan:"Перемещение жестом двумя пальцами (опционально)",map_only:"Map only (optional)",platforms_documentation:"Документация к выбранной платформе ({0})",selection:"Выбрано:",copy:"Копировать",copied:"Скопировано!",set_static_config:"Создать статическую конфигурацию",config_set:"Конфигурация установлена!\nОткройте редактор конфигурации, чтобы настроить его.",config_set_failed:"Не удалось обновить конфигурацию.",generate_rooms_config:"Сгенерировать конфигурацию комнат",copy_service_call:"Копировать вызов службы"},alerts:{set_static_config:"Эту функцию следует использовать только в том случае, если вы хотите вручную настроить автоматически созданную конфигурацию.\nПродолжить?"}},dn={common:tn,map_mode:an,validation:nn,tile:on,icon:rn,unit:sn,popups:ln,editor:cn},un={version:"Verzia",invalid_configuration:"Neplatná konfigurácia {0}",description:"Karta pomocou ktorej môžete ovládať váš vysávač",old_configuration:"Detekovaná zastaralá konfigurácia. Upravte prosím konfiguráciu alebo kartu vytvorte znovu od začiatku.",old_configuration_migration_link:"Návod na úpravu konfigurácie"},mn={invalid:"Neplatná šablóna",vacuum_goto:"Presun na bod",vacuum_goto_predefined:"Presun na bod zo zoznamu",vacuum_clean_segment:"Upratovanie miestnosti",vacuum_clean_point:"Upratovanie bodu",vacuum_clean_point_predefined:"Upratovanie bodu zo zoznamu",vacuum_clean_zone:"Upratovanie oblasti",vacuum_clean_zone_predefined:"Upratovanie oblasti zo zoznamu",vacuum_follow_path:"Trasa"},pn={preset:{entity:{missing:'Chýbajúca položka "entity"'},preset_name:{missing:'Chýbajúca položka "preset_name"'},platform:{invalid:"Neplatná platforma vysávača: {0}"},map_source:{missing:'Chýbajúca položka "map_source"',none_provided:"Chýbajúci odkaz na kameru alebo obrázok s mapou",ambiguous:"Povolený iba jeden zdroj mapy"},calibration_source:{missing:'Chýbajúca položka "calibration_source"',ambiguous:"Povolený iba jeden zdroj kalibrácie",none_provided:"Chýbajúci zdroj kalibrácie",calibration_points:{invalid_number:"Požadované 3 alebo 4 kalibračné body",missing_map:"Každý kalibračný bod musí obsahovať súradnice mapy",missing_vacuum:"Každý kalibračný bod musí obsahovať súradnice vysávača",missing_coordinate:'Súradnice mapy aj vysávače musia vždy obsahovať položku "x" a "y"'}},icons:{invalid:'Neplatná konfigurácia pre položku "icons"',icon:{missing:'Každý záznam v zozname ikon musí vždy obsahovať položku "icon"'}},tiles:{invalid:'Neplatná konfigurácia pre položku "tiles"',entity:{missing_outdated_translation:'Každý záznam v zozname dlaždíc musí vždy obsahovať položku "entity"'},label:{missing:'Každý záznam v zozname dlaždíc musí vždy obsahovať položku "label"'}},map_modes:{invalid:'Neplatná konfigurácia pre položku "map_modes"',icon:{missing:"Chýbajúca ikona pre mapový režim"},name:{missing:"Chýbajúci názov pre mapový režim"},template:{invalid:"Neplatná šablóna: {0}"},predefined_selections:{not_applicable:"Režim {0} nepodporuje výber z prednastavených možností",zones:{missing:"Chýbajúce konfigurácie oblastí",invalid_parameters_number:"Každá oblasť musí mať 4 parametre"},points:{position:{missing:"Chýbajúce konfigurácie bodov",invalid_parameters_number:"Každý bod musí mať 2 parametre"}},rooms:{id:{missing:"Chýbajúci ID miestnosti",invalid_format:"Neplatný ID miestnosti: {0}"},outline:{invalid_parameters_number:"Každý bod ohraničenia miestnosti musí mať 2 parametre"}},label:{x:{missing:'Štítok musí mať položku "x"'},y:{missing:'Štítok musí mať položku "y"'},text:{missing:'Štítok musí mať položku "text"'}},icon:{x:{missing:'Ikona musí mať položku "x"'},y:{missing:'Ikona musí mať položku "y"'},name:{missing:'Ikona musí mať položku "name"'}}},service_call_schema:{missing:"Chýbajúci formát volania služby",service:{missing:'Formát volania služby musí obsahovať položku "service"',invalid:"Neplatná služba: {0}"}}}},invalid_entities:"Neplatné entity:",invalid_calibration:"Neplatná kalibrácia, prosím skontrolujte konfiguráciu"},gn={status:{label:"Stav",value:{starting:"Zapínanie","charger disconnected":"Nabíječka odpojena",idle:"Nečinný","remote control active":"Diaľkové ovládanie aktívne",cleaning:"Upratovanie","returning home":"Návrat do základne","manual mode":"Manuálny režim",charging:"Nabíjanie","charging problem":"Problém s nabíjaním",paused:"Pozastavený","spot cleaning":"Upratovanie bodu",error:"Chyba","shutting down":"Vypínanie",updating:"Prebieha aktualizácia",docking:"Parkovanie","going to target":"Presun na bod","zoned cleaning":"Upratovanie oblasti","segment cleaning":"Upratovanie miestnosti","emptying the bin":"Vyprázdňovanie zásobníka","charging complete":"Nabíjanie dokončené","device offline":"Zariadenie je nedostupné"}},battery_level:{label:"Batéria"},fan_speed:{label:"Stupeň vysávania",value:{silent:"Tiché",standard:"Štandardné",medium:"Stredné",turbo:"Turbo",auto:"Automatické",gentle:"Slabé"}},sensor_dirty_left:{label:"Čistota senzorov"},filter_left:{label:"Životnosť filtra"},main_brush_left:{label:"Životnosť hlavnej kefy"},side_brush_left:{label:"Životnosť bočej kefy"},cleaning_count:{label:"Počet upratovaní"},cleaned_area:{label:"Uprataná plocha"},cleaning_time:{label:"Doba upratovania"},mop_left:{label:"Životnosť mopu"}},_n={vacuum_start:"Začať upratovanie",vacuum_pause:"Pozastaviť upratovanie",vacuum_stop:"Ukončiť upratovanie",vacuum_return_to_base:"Návrat do základne",vacuum_clean_spot:"Upratať bod",vacuum_locate:"Nájsť",vacuum_set_fan_speed:"Nastaviť stupeň vysávania"},hn={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},vn={success:"Volanie služby bolo úspešné",no_selection:"Nebol vykonaný žiadny výber",failed:"Volanie služby zlyhalo"},fn={description:{text:"Tento editor podporuje iba základnú konfiguráciu. Pre pokročilé nastavenia použite editor kódu."},label:{name:"Titulok (voliteľná položka)",entity:"Entita vysávača (povinná položka)",camera:"Entita kamery (povinná položka)",vacuum_platform:"Platforma vysávača (povinná položka)",map_locked:"Uzamknutie mapy",two_finger_pan:"Posuv mapy dvoma prstami",map_only:"Map only (optional)"}},bn={common:un,map_mode:mn,validation:pn,tile:gn,icon:_n,unit:hn,popups:vn,editor:fn},yn={version:"Version",invalid_configuration:"Ogiltig configuration {0}",description:"Ett kort som låter dig kontrollera din dammsugare",old_configuration:"Gammal konfiguration upptäckt. Editera din konfiguration till senaste schema eller skapa ett nytt kort från början.",old_configuration_migration_link:"Guide för migrering"},kn={invalid:"Ogiltig template!",vacuum_goto:"Klicka & Gå",vacuum_goto_predefined:"Punkter",vacuum_clean_segment:"Rum",vacuum_clean_point:"Städpunkt",vacuum_clean_point_predefined:"Punkter",vacuum_clean_zone:"Zonstädning",vacuum_clean_zone_predefined:"Zonlista",vacuum_follow_path:"Bana"},xn={preset:{entity:{missing:"Saknar egenskap: entity"},preset_name:{missing:"Saknar egenskap: preset_name"},platform:{invalid:"Ogiltig dammsugarplattform: {0}"},map_source:{missing:"Saknar egenskap: map_source",none_provided:"Ingen kamera elle bild angiven",ambiguous:"Endast en kartkälla tillåts"},calibration_source:{missing:"Saknar egenskap: calibration_source",ambiguous:"Endast en kalibreringskälla tillåts",none_provided:"Ingen kallibreringskälla angiven",calibration_points:{invalid_number:"Exakt 3 eller 4 kalibreringspunkter krävs",missing_map:"Varje kalibreringspunkt måste innehålla koordinater för karta",missing_vacuum:"Varje kalibreringspunkt måste innehålla koordinater för dammsugare",missing_coordinate:"Kalibreringspunkter för karta och dammsugare måste innehålla både x och y koordinater"}},icons:{invalid:"Fel i konfigurationen: icons",icon:{missing:"Varje post med icons måste innehålla icon-egenskap"}},tiles:{invalid:"Fel i konfigurationen: tiles",entity:{missing_outdated_translation:"Varje post med tiles måste innehålla entity"},label:{missing:"Varje post med tiles måste innehålla label"}},map_modes:{invalid:"Fel i konfigurationen: map_modes",icon:{missing:"Saknar ikon för map mode"},name:{missing:"Saknar namn för map mode"},template:{invalid:"Ogiltig template: {0}"},predefined_selections:{not_applicable:"Läge {0} har inte stöd för fördefinierade val",zones:{missing:"Zonens konfiguration saknas",invalid_parameters_number:"Varje zon måste ha 4 parametrar"},points:{position:{missing:"Punktens konfiguration saknas",invalid_parameters_number:"Varje punkt måste ha 2 parametrar"}},rooms:{id:{missing:"Rummets id saknas",invalid_format:"Felaktigt id för rum: {0}"},outline:{invalid_parameters_number:"Varje punk för rumskonturen måste ha 2 parametrar"}},label:{x:{missing:"Label måste ha egenskapen x"},y:{missing:"Label måste ha egenskapen y"},text:{missing:"Label måste ha egenskapen text"}},icon:{x:{missing:"Icon måste ha egenskapen x"},y:{missing:"Icon måste ha egenskapen y"},name:{missing:"Icon måste ha egenskapen name"}}},service_call_schema:{missing:"Service call schema saknas",service:{missing:"Service call schema måste innehålla service",invalid:"Ogiltig service: {0}"}}}},invalid_entities:"Ogiltiga entiteter:",invalid_calibration:"Ogiltig kalibrering, vänligen se över din konfiguration"},zn={status:{label:"Status",value:{starting:"Startar","charger disconnected":"Laddare frånkopplad",idle:"Inaktiv","remote control active":"Fjärrkontroll aktiv",cleaning:"Städar","returning home":"Återvänder hem","manual mode":"Manuellt läge",charging:"Laddar","charging problem":"Laddningsproblem",paused:"Pausad","spot cleaning":"Spot-rengöring",error:"Fel","shutting down":"Stänger av",updating:"Uppdaterar",docking:"Dockar","going to target":"Går till destination","zoned cleaning":"Städning av zon","segment cleaning":"Städning av rum","emptying the bin":"Tömmer behållaren","charging complete":"Färdigladdad","device offline":"Enhet offline"}},battery_level:{label:"Batteri"},fan_speed:{label:"Fläkthastighet",value:{silent:"Tyst",standard:"Standard",medium:"Medium",turbo:"Turbo",auto:"Auto",gentle:"Försiktig"}},sensor_dirty_left:{label:"Sensorer kvar"},filter_left:{label:"Filter kvar"},main_brush_left:{label:"Huvudborste kvar"},side_brush_left:{label:"Sidoborste kvar"},cleaning_count:{label:"Antal städningar"},cleaned_area:{label:"Städat område"},cleaning_time:{label:"Städtid"},mop_left:{label:"Mopp kvar"}},wn={vacuum_start:"Start",vacuum_pause:"Paus",vacuum_stop:"Stopp",vacuum_return_to_base:"Återgå till basen",vacuum_clean_spot:"Spot-rengöring",vacuum_locate:"Lokalisera",vacuum_set_fan_speed:"Ändra fläkthastighet"},An={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},En={success:"Lyckades!",no_selection:"Inget urval tillhandahålls",failed:"Mysslyckades kalla på tjänsten"},Sn={description:{text:"Denna visuella redigerare stöder endast en grundläggande konfiguration. Använd YAML-läget för avancerade inställningar."},label:{name:"Titel (valfritt)",entity:"Dammsugar-entitet (obligatoriskt)",camera:"Kamera-entitet (obligatoriskt)",vacuum_platform:"Dammsugarplattform (obligatoriskt)",map_locked:"Låst karta (valfritt)",two_finger_pan:"Panorering med två fingrar (valfritt)",map_only:"Map only (optional)"}},Pn={common:yn,map_mode:kn,validation:xn,tile:zn,icon:wn,unit:An,popups:En,editor:Sn},Cn={version:"Sürüm",invalid_configuration:"Geçersiz yapılandırma {0}",description:"Vakumunuzu kontrol etmenizi sağlayan bir kart",old_configuration:"Eski yapılandırma algılandı. Yapılandırmanızı en son şemaya göre ayarlayın veya sıfırdan yeni bir kart oluşturun.",old_configuration_migration_link:"Taşıma kılavuzu"},Mn={invalid:"Geçersiz şablon!",vacuum_goto:"Sabitle ve Git",vacuum_goto_predefined:"Noktalar",vacuum_clean_segment:"Odalar",vacuum_clean_point:"Temiz alan",vacuum_clean_point_predefined:"Noktalar",vacuum_clean_zone:"Bölge temizliği",vacuum_clean_zone_predefined:"Bölge listesi",vacuum_follow_path:"Yol"},Tn={preset:{entity:{missing:"Eksik özellik: varlık"},preset_name:{missing:"Eksik özellik: ön_ayar_adı(preset_name)"},platform:{invalid:"Geçersiz vakum platformu: {0}"},map_source:{missing:"Eksik özellik: harita kaynağı (map_source)",none_provided:"Kamera yok, görüntü de sağlanmadı",ambiguous:"Yalnızca bir harita kaynağına izin verilir"},calibration_source:{missing:"Eksik özellik: kalibrasyon_kaynak (calibration_source)",ambiguous:"Yalnızca bir kalibrasyon kaynağına izin verilir",none_provided:"Kalibrasyon kaynağı sağlanmadı",calibration_points:{invalid_number:"Tam olarak 3 veya 4 kalibrasyon noktası gerekli",missing_map:"Her kalibrasyon noktası harita koordinatlarını içermelidir",missing_vacuum:"Her kalibrasyon noktası vakum koordinatlarını içermelidir",missing_coordinate:"Harita ve vakum kalibrasyon noktaları hem x hem de y koordinatını içermelidir"}},icons:{invalid:"Yapılandırmada hata: simgeler",icon:{missing:"Simgeler listesinin her girişi, simge özelliği içermelidir"}},tiles:{invalid:"Yapılandırmada hata: döşemeler",entity:{missing_outdated_translation:"Kutucuk listesinin her girişi varlık içermelidir"},label:{missing:"Fayans listesinin her girişi etiket içermelidir"}},map_modes:{invalid:"Yapılandırmada hata: map_modes",icon:{missing:"Harita modunun eksik simgesi"},name:{missing:"Harita modunun adı eksik"},template:{invalid:"Geçersiz şablon: {0}"},predefined_selections:{not_applicable:"Mod {0} önceden tanımlanmış seçimleri desteklemiyor",zones:{missing:"Eksik bölge yapılandırması",invalid_parameters_number:"Her bölgenin 4 parametresi olmalıdır"},points:{position:{missing:"Eksik nokta yapılandırması",invalid_parameters_number:"Her noktanın 2 parametresi olmalıdır"}},rooms:{id:{missing:"Eksik oda kimliği",invalid_format:"Geçersiz oda kimliği: {0}"},outline:{invalid_parameters_number:"Oda anahattının her noktası 2 parametreye sahip olmalıdır"}},label:{x:{missing:"Etiketin x özelliği olmalıdır"},y:{missing:"Etiketin y özelliği olmalıdır"},text:{missing:"Etiketin metin özelliği olmalıdır"}},icon:{x:{missing:"Simgenin x özelliği olmalıdır"},y:{missing:"Simgenin y özelliği olmalıdır"},name:{missing:"Simge isim özelliğine sahip olmalıdır"}}},service_call_schema:{missing:"Eksik servis çağrısı şeması",service:{missing:"Servis çağrısı şeması servis içermelidir",invalid:"Geçersiz hizmet: {0}"}}}},invalid_entities:"Geçersiz varlıklar:",invalid_calibration:"Geçersiz kalibrasyon, lütfen yapılandırmanızı kontrol edin"},Rn={status:{label:"Durum",value:{starting:"Başlangıç","charger disconnected":"Şarj cihazının bağlantısı kesildi",idle:"Idle","remote control active":"Uzaktan kumanda aktif",cleaning:"Temizleme","returning home":"Eve dönüş","manual mode":"Manual mod",charging:"Şarj oluyor","charging problem":"Şarj sorunu",paused:"Duraklatıldı","spot cleaning":"Nokta temizleme",error:"Hata","shutting down":"Kapatılıyor",updating:"Güncelleniyor",docking:"Yerleştirme","going to target":"Hedefe gidiyor","zoned cleaning":"Bölgeli temizlik","segment cleaning":"Segment temizliği","emptying the bin":"Çöp haznesini boşalt","charging complete":"Şarj tamamlandı","device offline":"Cihaz çevrimdışı"}},battery_level:{label:"Pil"},fan_speed:{label:"Süpürme Modu",value:{silent:"Sessiz",standard:"Standart",medium:"Orta",turbo:"Güçlü",auto:"Otomatik",gentle:"Uysal"}},sensor_dirty_left:{label:"Sensör kirli"},filter_left:{label:"Filtre"},main_brush_left:{label:"Ana Fırça"},side_brush_left:{label:"Yan Fırça"},cleaning_count:{label:"Temizleme sayısı"},cleaned_area:{label:"Temizlenmiş alan"},cleaning_time:{label:"Temizlik zamanı"},mop_left:{label:"Paspaslama"}},jn={vacuum_start:"Başlat",vacuum_pause:"Duraklat",vacuum_stop:"Durdur",vacuum_return_to_base:"Üniteye geri dön",vacuum_clean_spot:"Temiz nokta",vacuum_locate:"Bul",vacuum_set_fan_speed:"Fan hızını değiştir"},$n={hour_shortcut:"S",meter_shortcut:"D",meter_squared_shortcut:"m²",minute_shortcut:"Sn"},Nn={success:"Başarı!",no_selection:"Seçim sağlanmadı",failed:"Servis aranamadı"},In={description:{text:"Bu görsel düzenleyici yalnızca temel yapılandırmayı destekler. Daha gelişmiş kurulum için YAML modunu kullanın."},label:{name:"Başlık (isteğe bağlı)",entity:"Vakum varlığı (gerekli)",camera:"Kamera varlığı (gerekli)",vacuum_platform:"Vakum platformu (gerekli)",map_locked:"Harita kilitli (isteğe bağlı)",two_finger_pan:"İki parmaklı tava (isteğe bağlı)",map_only:"Map only (optional)"}},Ln={common:Cn,map_mode:Mn,validation:Tn,tile:Rn,icon:jn,unit:$n,popups:Nn,editor:In},On={version:"Версія",invalid_configuration:"Недійсна конфігурація {0}",description:"Картка, яка дає змогу контролювати пилосос",old_configuration:"Виявлено стару конфігурацію. Налаштуйте конфігурацію до останньої схеми або створіть нову картку з початку.",old_configuration_migration_link:"Посібник з міграції"},Dn={invalid:"Недійсний шаблон!",vacuum_goto:"Рух до цілі",vacuum_goto_predefined:"Збережені точки",vacuum_clean_segment:"Кімнати",vacuum_clean_point:"Точкове прибирання",vacuum_clean_point_predefined:"Збережені точки",vacuum_clean_zone:"Зональне прибирання",vacuum_clean_zone_predefined:"Список зон",vacuum_follow_path:"Шлях"},Vn={preset:{entity:{missing:"Відсутній параметр: entity"},preset_name:{missing:"Відсутній параметр: preset_name"},platform:{invalid:"Недійсна платформа пилососа: {0}"},map_source:{missing:"Відсутній параметр: map_source",none_provided:"Не вказано джерело мапи",ambiguous:"Дозволено тільки одне джерело мапи"},calibration_source:{missing:"Відсутній параметр: calibration_source",ambiguous:"Дозволено тільки одне джерело калібрування",none_provided:"Не вказано джерело калібрування",calibration_points:{invalid_number:"Потрібні 3 або 4 точки калібрування",missing_map:"Кожна точка калібрування повинна мати координати на мапі",missing_vacuum:"Кожна точка калібрування повинна мати координати в системі пилососа",missing_coordinate:"Кожна точка калібрування повинна мати координати x і y"}},icons:{invalid:"Помилка в конфігурації: icons",icon:{missing:'Кожен елемент у списку піктограм повинен мати параметр "icon"'}},tiles:{invalid:"Помилка в конфігурації: tiles",entity:{missing:'Кожен елемент у списку плиток повинен мати параметр "entity" або внутрішню змінну'},label:{missing:'Кожен елемент у списку плиток повинен мати параметр "label"'}},map_modes:{invalid:"Помилка в конфігурації: map_modes",icon:{missing:"Відсутня піктограма шаблону режиму мапи"},name:{missing:"Відсутня назва шаблону режиму мапи"},template:{invalid:"Недійсний шаблон: {0}"},predefined_selections:{not_applicable:"Шаблон {0} не підтримує збереження вибраних елементів",zones:{missing:"Відсутній список збережених зон",invalid_parameters_number:"Кожна збережена зона повинна мати 4 координати"},points:{position:{missing:"Відсутній список збережених точок",invalid_parameters_number:"Кожна записана точка повинна мати 2 координати"}},rooms:{id:{missing:"Відсутній ідентифікатор кімнати",invalid_format:"Недійсний ідентифікатор кімнати: {0}"},outline:{invalid_parameters_number:"Кожна точка контуру кімнати повинна мати 2 координати"}},label:{x:{missing:"Кожна мітка повинна мати координату x"},y:{missing:"Кожна мітка повинна мати координату y"},text:{missing:"Кожна мітка повинна містити текст"}},icon:{x:{missing:"Кожна піктограма повинна мати координату x"},y:{missing:"Кожна піктограма повинна мати координату y"},name:{missing:'Кожна піктограма повинна мати параметр "name"'}}},service_call_schema:{missing:"Відсутня схема виклику служби",service:{missing:"Кожна схема служби повинна мати назву служби",invalid:"Недійсна служба: {0}"}}}},invalid_entities:"Недійсні сутності:",invalid_calibration:"Неправильне калібрування, перевірте конфігурацію"},Un={status:{label:"Статус",value:{starting:"Початок","charger disconnected":"Зарядний пристрій відключено",idle:"Неактивний","remote control active":"Пульт",cleaning:"Прибирання","returning home":"Повернення до док-станції","manual mode":"Ручний режим",charging:"Заряджання","charging problem":"Проблема з заряджанням",paused:"Призупинено","spot cleaning":"Точкове очищення",error:"Помилка","shutting down":"Вимкнення",updating:"Оновлення",docking:"Стиковка","going to target":"По шляху до цілі","zoned cleaning":"Зональне прибирання","segment cleaning":"Прибирання кімнати","emptying the bin":"Спорожнення контейнера","charging complete":"Заряджання завершено","device offline":"Офлайн"}},battery_level:{label:"Батарея"},fan_speed:{label:"Потужність",value:{silent:"Тихий",standard:"Стандарт",medium:"Середній",turbo:"Турбо",auto:"Авто",gentle:"Делікатний"}},sensor_dirty_left:{label:"Сенсор"},filter_left:{label:"Фільтр"},main_brush_left:{label:"Основна щітка"},side_brush_left:{label:"Бокова щітка"},cleaning_count:{label:"Лічильник прибирань"},cleaned_area:{label:"Прибрано"},total_cleaned_area:{label:"Всього прибрано"},cleaning_time:{label:"Час прибирання"},total_cleaning_time:{label:"Загальний час прибирання"},mop_left:{label:"Швабра"},bin_full:{label:"Контейнер повний",value:{true:"Так",false:"Ні"}},bin_present:{label:"Контейнер встановлено",value:{true:"Так",false:"Ні"}},water_volume:{label:"Об'єм води"},mop_pad_humidity:{label:"Швабра"}},Kn={vacuum_start:"Старт",vacuum_pause:"Пауза",vacuum_stop:"Стоп",vacuum_return_to_base:"Повернення на базу",vacuum_clean_spot:"Прибрати місце",vacuum_locate:"Пошук",vacuum_set_fan_speed:"Зміна потужності"},Fn={hour_shortcut:"h",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"min"},qn={success:"Успіх!",no_selection:"Виділення не зроблено",failed:"Не вдалося викликати службу"},Hn={description:{text:"Цей редактор інтерфейсу підтримує лише базову конфігурацію. Для більш розширеного налаштування використовуйте режим YAML."},label:{name:"Назва (опція)",entity:"Сутність пилососу (необхідно)",camera:"Сутність камери (необхідно)",vacuum_platform:"Платформа інтеграції пилососу (необхідно)",map_locked:"Блокування мапи (опція)",two_finger_pan:"Переміщення мапи двома пальцями (опція)",map_only:"Map only (optional)",platforms_documentation:"Документація обраної платформи ({0})",selection:"Вибір:",copy:"Скопіювати",copied:"Скопійовано!",set_static_config:"Згенерувати статичну конфігурацію",config_set:"Конфігурація встановлена!\nВідкрийте редактор конфігурації щоб змінити.",config_set_failed:"Не вдалось оновити конфігурацію.",generate_rooms_config:"Згенерувати конфігурацію кімнат",copy_service_call:"Скопіювати визов сервісу"},alerts:{set_static_config:"Ви повинні використовувати цю функціональність тільки якщо хочете вручну налаштувати автоматично згенеровану конфігурацію.\nПродовжити?"}},Gn={common:On,map_mode:Dn,validation:Vn,tile:Un,icon:Kn,unit:Fn,popups:qn,editor:Hn},Bn={version:"版本",invalid_configuration:"配置无效 {0}",description:"一个可以控制扫地机的卡片",old_configuration:"检测到旧版本的配置。请按照新版本说明修改配置或者重新创建新卡片",old_configuration_migration_link:"迁移向导"},Zn={invalid:"模板无效！",vacuum_goto:"指哪到哪",vacuum_goto_predefined:"目标点",vacuum_clean_segment:"选区清扫",vacuum_clean_point:"局部清扫",vacuum_clean_point_predefined:"自定义局部清扫",vacuum_clean_zone:"划区清扫",vacuum_clean_zone_predefined:"自定义区域清扫",vacuum_follow_path:"路径规划"},Yn={preset:{entity:{missing:"缺少属性：entity"},preset_name:{missing:"缺少属性：preset_name"},platform:{invalid:"扫地机平台无效：{0}"},map_source:{missing:"缺少属性：map_source",none_provided:"未提供摄像头或者图像",ambiguous:"只允许一张地图"},calibration_source:{missing:"缺少属性：calibration_source",ambiguous:"只允许一个校准源",none_provided:"未提供校准源",calibration_points:{invalid_number:"需要3或4个校准点",missing_map:"每个校准点必须包含地图坐标",missing_vacuum:"每个校准点必须包含扫地机坐标",missing_coordinate:"地图校准点和扫地机校准点必须同时包含x坐标和y坐标"}},icons:{invalid:"配置错误：icons",icon:{missing:"图标列表中每一条记录必须包含icon属性"}},tiles:{invalid:"配置错误：tiles",entity:{missing_outdated_translation:"板块列表中每一条记录必须包含实体"},label:{missing:"板块列表中每一条记录必须包含标签"}},map_modes:{invalid:"配置错误：map_modes",icon:{missing:"缺少该地图模式的图标"},name:{missing:"缺少该地图模式的名称"},template:{invalid:"模板无效：{0}"},predefined_selections:{not_applicable:"模式 {0} 不支持选择预置",zones:{missing:"缺少区域配置",invalid_parameters_number:"每个区域必须包含4个参数"},points:{position:{missing:"缺少坐标点配置",invalid_parameters_number:"每个坐标点必须包含2个参数"}},rooms:{id:{missing:"缺少房间id",invalid_format:"房间id无效：{0}"},outline:{invalid_parameters_number:"每个房间边框必须包含2个参数"}},label:{x:{missing:"标签必须包含x值"},y:{missing:"标签必须包含y值"},text:{missing:"标签必须包含文本值"}},icon:{x:{missing:"图标必须包含x值"},y:{missing:"标题必须包含y值"},name:{missing:"标题必须包含名称"}}},service_call_schema:{missing:"缺少服务调用架构",service:{missing:"服务调用架构必须包含服务",invalid:"服务无效：{0}"}}}},invalid_entities:"实体无效：",invalid_calibration:"校准无效，请检查配置"},Xn={status:{label:"状态",value:{starting:"开始清扫","charger disconnected":"与充电座断开",idle:"空闲",sleeping:"休眠","remote control active":"开始遥控模式",cleaning:"清扫中","returning home":"正在回充","manual mode":"手动模式",charging:"正在充电","charging problem":"充电错误",paused:"暂停","spot cleaning":"局部清扫",error:"错误","shutting down":"正在关机",updating:"正在更新",docking:"停靠","going to target":"正在前往目标点","zoned cleaning":"划区清扫","segment cleaning":"选区清扫","emptying the bin":"清理尘盒","charging complete":"充电完成","device offline":"设备离线"}},battery_level:{label:"剩余电量"},fan_speed:{label:"吸力",value:{silent:"安静",standard:"标准",medium:"强力",strong:"强力",turbo:"超强",auto:"自动",gentle:"轻柔"}},sensor_dirty_left:{label:"传感器维护剩余"},filter_left:{label:"滤网剩余"},main_brush_left:{label:"主刷剩余"},side_brush_left:{label:"边刷剩余"},cleaning_count:{label:"总清扫次数"},cleaned_area:{label:"总清扫面积"},cleaning_time:{label:"总清扫时间"},mop_left:{label:"拖布剩余"}},Wn={vacuum_start:"开始",vacuum_pause:"暂停",vacuum_stop:"结束",vacuum_return_to_base:"回充",vacuum_clean_spot:"局部清扫",vacuum_locate:"定位",vacuum_set_fan_speed:"更改吸力"},Jn={hour_shortcut:"小时",meter_shortcut:"米",meter_squared_shortcut:"平米",minute_shortcut:"分钟"},Qn={success:"指令发送成功！",no_selection:"未提供选择",failed:"调用服务失败"},eo={description:{text:"该可视化编辑器仅支持一些基本配置。想要使用高级设置，请使用YAML模式"},label:{name:"标题（可选）",entity:"扫地机实体（必填）",camera:"摄像机实体（必填）",vacuum_platform:"扫地机平台（必填）",map_locked:"地图锁定（可选）",two_finger_pan:"双指缩放（可选）",map_only:"Map only (optional)"}},to={common:Bn,map_mode:Zn,validation:Yn,tile:Xn,icon:Wn,unit:Jn,popups:Qn,editor:eo},ao={version:"版本",invalid_configuration:"設定錯誤 {0}",description:"一張能讓您控制掃地機器人的卡片",old_configuration:"檢測到設定已過時，請按照新版本說明並進行修正或重新新增一張新的卡片",old_configuration_migration_link:"移轉指南"},io={invalid:"模板錯誤!",vacuum_goto:"指哪到哪",vacuum_goto_predefined:"目標點",vacuum_clean_segment:"選區清掃",vacuum_clean_point:"局部清掃",vacuum_clean_point_predefined:"局部目標",vacuum_clean_zone:"劃區清掃",vacuum_clean_zone_predefined:"目標區域",vacuum_follow_path:"路徑規劃"},no={preset:{entity:{missing:"設定錯誤: entity"},preset_name:{missing:"設定錯誤: preset_name"},platform:{invalid:"錯誤的 vacuum platform: {0}"},map_source:{missing:"設定錯誤: map_source",none_provided:"未提供攝影機或圖片",ambiguous:"只允許一張地圖源"},calibration_source:{missing:"設定錯誤: calibration_source",ambiguous:"只允許一個校準源",none_provided:"未提供校準源",calibration_points:{invalid_number:"需要 3 或 4 個校準點",missing_map:"每個校準點必須包含地圖座標",missing_vacuum:"每個校準點必須包含吸塵器座標",missing_coordinate:"地圖校準點和吸塵器校準點必須同時包含 x 座標和 y 座標"}},icons:{invalid:"設定錯誤: icons",icon:{missing:"Icon list 必須包含 icon"}},tiles:{invalid:"設定錯誤: tiles",entity:{missing_outdated_translation:"tiles list 必須包含 entity"},label:{missing:"tiles list 必須包含 label"}},map_modes:{invalid:"設定錯誤: map_modes",icon:{missing:"Map modes 的 icon(圖標) 設定錯誤"},name:{missing:"Map modes 的 name(名稱) 設定錯誤"},template:{invalid:"模板錯誤: {0}"},predefined_selections:{not_applicable:"Mode {0} 不支援 predefined selections",zones:{missing:"zones 設定錯誤",invalid_parameters_number:"zones 必須包含 4 個參數"},points:{position:{missing:"points 設定錯誤",invalid_parameters_number:"points 必須包含 2 個參數"}},rooms:{id:{missing:"room id 錯誤",invalid_format:"room id 錯誤: {0}"},outline:{invalid_parameters_number:"room 的 point(座標) 必須包含 2 個參數"}},label:{x:{missing:"label 必須包含 x 值"},y:{missing:"label 必須包含 y 值"},text:{missing:"label 必須包含 text"}},icon:{x:{missing:"icon 必須包含 x 值"},y:{missing:"icon 必須包含 y 值"},name:{missing:"icon 必須包含 name"}}},service_call_schema:{missing:"服務執行失敗",service:{missing:"執行服務(service)必須包含該服務(service)",invalid:"服務錯誤: {0}"}}}},invalid_entities:"錯誤的 entities(實體): ",invalid_calibration:"calibration(校準)失敗，請檢查設定"},oo={status:{label:"狀態",value:{starting:"開始清掃","charger disconnected":"與充電座斷開",idle:"閒置","remote control active":"開始遙控模式",cleaning:"清掃中","returning home":"回充中","manual mode":"手動模式",charging:"充電中","charging problem":"充電錯誤",paused:"暫停","spot cleaning":"局部清掃",error:"錯誤","shutting down":"關機中",updating:"更新中",docking:"Docking","going to target":"正在行進至目標點","zoned cleaning":"劃區清掃","segment cleaning":"選區清掃","emptying the bin":"清理集塵盒","charging complete":"充電完成","device offline":"裝置離線"}},battery_level:{label:"剩餘電量"},fan_speed:{label:"吸力",value:{silent:"安靜",standard:"標準",medium:"強力",turbo:"MAX",auto:"自動",gentle:"拖地"}},sensor_dirty_left:{label:"感應器剩餘"},filter_left:{label:"濾網剩餘"},main_brush_left:{label:"主刷剩餘"},side_brush_left:{label:"邊刷剩餘"},cleaning_count:{label:"累積清掃次數"},cleaned_area:{label:"累積清掃面積"},cleaning_time:{label:"累積清掃時間"},mop_left:{label:"抹布剩餘"}},ro={vacuum_start:"開始",vacuum_pause:"暫停",vacuum_stop:"停止",vacuum_return_to_base:"回充",vacuum_clean_spot:"局部清掃",vacuum_locate:"定位",vacuum_set_fan_speed:"調整吸力"},so={hour_shortcut:"小時",meter_shortcut:"m",meter_squared_shortcut:"m²",minute_shortcut:"分鐘"},lo={success:"Success!",no_selection:"未選擇目標",failed:"執行服務失敗"},co={description:{text:"此面板僅支援基本的設定。如需更豐富的進階設定，請使用 YAML 編輯"},label:{name:"標題（選填）",entity:"掃地機器人實體（必填）",camera:"攝影機實體（必填）",vacuum_platform:"vacuum platform（必填）",map_locked:"鎖定地圖（選填）",two_finger_pan:"雙指縮放（選填）",map_only:"Map only (optional)"}},uo={common:ao,map_mode:io,validation:no,tile:oo,icon:ro,unit:so,popups:lo,editor:co};const mo={bg:Ce,ca:De,cs:Ye,da:ot,de:_t,el:At,en:Object.freeze({__proto__:null,common:Et,default:Nt,dreame_ui:jt,editor:$t,icon:Mt,map_mode:St,popups:Rt,tile:Ct,unit:Tt,validation:Pt}),es:Object.freeze({__proto__:null,common:It,default:qt,editor:Ft,icon:Vt,map_mode:Lt,popups:Kt,tile:Dt,unit:Ut,validation:Ot}),fi:Object.freeze({__proto__:null,common:Ht,default:Qt,editor:Jt,icon:Yt,map_mode:Gt,popups:Wt,tile:Zt,unit:Xt,validation:Bt}),fr:Object.freeze({__proto__:null,common:ea,default:ca,dreame_ui:sa,editor:la,icon:na,map_mode:ta,popups:ra,tile:ia,unit:oa,validation:aa}),he:Object.freeze({__proto__:null,common:da,default:fa,editor:va,icon:ga,map_mode:ua,popups:ha,tile:pa,unit:_a,validation:ma}),hu:Object.freeze({__proto__:null,common:ba,default:Sa,editor:Ea,icon:za,map_mode:ya,popups:Aa,tile:xa,unit:wa,validation:ka}),is:Object.freeze({__proto__:null,common:Pa,default:Ia,editor:Na,icon:Ra,map_mode:Ca,popups:$a,tile:Ta,unit:ja,validation:Ma}),it:Object.freeze({__proto__:null,common:La,default:Ha,editor:qa,icon:Ua,map_mode:Oa,popups:Fa,tile:Va,unit:Ka,validation:Da}),lv:Object.freeze({__proto__:null,common:Ga,default:ei,editor:Qa,icon:Xa,map_mode:Ba,popups:Ja,tile:Ya,unit:Wa,validation:Za}),"nb-NO":Object.freeze({__proto__:null,common:ti,default:ci,editor:li,icon:oi,map_mode:ai,popups:si,tile:ni,unit:ri,validation:ii}),nl:Object.freeze({__proto__:null,common:di,default:fi,editor:vi,icon:gi,map_mode:ui,popups:hi,tile:pi,unit:_i,validation:mi}),pl:Object.freeze({__proto__:null,common:bi,default:Si,editor:Ei,icon:zi,map_mode:yi,popups:Ai,tile:xi,unit:wi,validation:ki}),pt:Object.freeze({__proto__:null,common:Pi,default:Ii,editor:Ni,icon:Ri,map_mode:Ci,popups:$i,tile:Ti,unit:ji,validation:Mi}),"pt-BR":Object.freeze({__proto__:null,common:Li,default:Hi,editor:qi,icon:Ui,map_mode:Oi,popups:Fi,tile:Vi,unit:Ki,validation:Di}),ro:Object.freeze({__proto__:null,common:Gi,default:en,editor:Qi,icon:Xi,map_mode:Bi,popups:Ji,tile:Yi,unit:Wi,validation:Zi}),ru:Object.freeze({__proto__:null,common:tn,default:dn,editor:cn,icon:rn,map_mode:an,popups:ln,tile:on,unit:sn,validation:nn}),sk:Object.freeze({__proto__:null,common:un,default:bn,editor:fn,icon:_n,map_mode:mn,popups:vn,tile:gn,unit:hn,validation:pn}),sv:Object.freeze({__proto__:null,common:yn,default:Pn,editor:Sn,icon:wn,map_mode:kn,popups:En,tile:zn,unit:An,validation:xn}),tr:Object.freeze({__proto__:null,common:Cn,default:Ln,editor:In,icon:jn,map_mode:Mn,popups:Nn,tile:Rn,unit:$n,validation:Tn}),uk:Object.freeze({__proto__:null,common:On,default:Gn,editor:Hn,icon:Kn,map_mode:Dn,popups:qn,tile:Un,unit:Fn,validation:Vn}),zh:Object.freeze({__proto__:null,common:Bn,default:to,editor:eo,icon:Wn,map_mode:Zn,popups:Qn,tile:Xn,unit:Jn,validation:Yn}),"zh-Hant":Object.freeze({__proto__:null,common:ao,default:uo,editor:co,icon:ro,map_mode:io,popups:lo,tile:oo,unit:so,validation:no})};let po=null;function go(e,t="",a="",i="",n=e){const o="en";if(!i){if(!po)try{po=JSON.parse(localStorage.getItem("selectedLanguage")||`"${o}"`)}catch{po=(localStorage.getItem("selectedLanguage")||o).replace(/['"]+/g,"")}i=po??o}let r;try{r=_o(e,i??o)}catch{r=_o(e,o)}return void 0===r&&(r=_o(e,o)),r=r??n,""!==t&&""!==a&&(r=r.replaceAll(t,a)),r}function _o(e,t){try{return e.split(".").reduce((e,t)=>e[t],mo[t])}catch{return}}function ho(e,t,a){return"string"==typeof e?go(e,"","",t,a):go(...e,t,a)}function vo(e,t,a,i){return ho(e,a?.language??t?.locale?.language,i)}var fo,bo;!function(e){e[e.MANUAL_RECTANGLE=0]="MANUAL_RECTANGLE",e[e.PREDEFINED_RECTANGLE=1]="PREDEFINED_RECTANGLE",e[e.ROOM=2]="ROOM",e[e.MANUAL_PATH=3]="MANUAL_PATH",e[e.MANUAL_POINT=4]="MANUAL_POINT",e[e.PREDEFINED_POINT=5]="PREDEFINED_POINT"}(fo||(fo={})),function(e){e[e.NONE=0]="NONE",e[e.INTERNAL=1]="INTERNAL",e[e.EXTERNAL=2]="EXTERNAL",e[e.REPEAT=3]="REPEAT"}(bo||(bo={}));const yo="dreame-vacuum-card",ko="dreame-vacuum-card-editor",xo="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAADwCAYAAABxLb1rAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5QsWDwwxfsgRyAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAtkSURBVHja7d19zCVXXQfw725368JuC7JtUWKXKiLUF7aQVhRYSUEUGiGAaEUJEkBAMWZVasQivlQrxVZAFgIiiYCgIWDiGxZECoKKS60FxQCW1yLU0hcXWlraZdc/znmSeWbvs8+duTNz99l+PslNdp699/zuzD33d+ecOedMAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAoNh2n+3VWkicneWiSByT5xiTbk3w1yS1Jbkjy8fr41yT/mOTAgjHvmeRRSR6T5CFJTq2PE5P8X5Lrk/xHkquSvCPJfy3wme1O8tga7/QkpyXZkeTGGue/k1xeH/+jmh+zpqozzJk0Dh/lcTDJbUm+lOQTSd6T5DVJnpXkm3rGfPY6MZuPq+co7+FJ9ncoc+Xx9SQfSPL8JCd13IddSV6d5PaOMT+e5NeS3KtDrPPql2HeGIeSvCXJ/QaqC9cm2dahnFNar9+7QWL2ebxoSXXm8MiPbRMfr2XkoYV37lCSf07yY0k2LyEBbkpySX0fi34wP9jh/e9N8rUF492a5IJ14uxI8lcLxLgzyS8PVBcuWEIyuuA4SoBD15m7WgIcNA9tzjA2Jfn+JG9N8uEkD5747PVVSX6l1aR/b5JnJjkzycm1WfHNSb6nNo9fkeTfe8bbmuRNSV5Wy11xXZLLahK9b5K71eb3mfXsbV+Sz7bKunuSRx4l1r1rE/3xrb/vr0ntrNoE/oYk35JkT/0xaDZ9tyS5NMkfDfCZv7A23aa0jJhDm7LO3JW79HrnoXbm3df6/xNqIrlPDfL0JH9SP8B2Jv5akqf12IG3tcqZ55T2ia3X3JLkRzvEvF+S3699gPOeAf7hjF+ei2o/4zwf0uOT/Gfj9X9zlB+oK1qxbkjy1Dni3D3JS2acFV/Yoy78bWv7JROcjS0j5r4Rv5xT1Zm1fKbx2usGaiWOcbyWlof67tzWJM9I8skZH/DTJ0iA7T6/J/U88KfV/rL1EuBTZxzkH+8Rb0uSX6/N07Uq84tasf63nsF28TOtJHiw9pV2qQvnt758X60VcMxktIyYYyXAKevM8Z4AR8tDi+7c9iRvbJVxe5KzR0yA92k9f+yrZNuSfLHDF2we5yZ5w4y/n1o7e5sf5Lk9Y1zaes//1LEuPCXJE1p/e93IyWgZMfdt8DpzV06AC+ehoXbuda1yPlx/ucZIgA9rPf9tIyfAn2/FuyLjDSX6zVas1y9Q1t2SfLpV3vd1TEZJuVLePJN84MgJcOqY+zZ4nZEAO+ahzSPswM/VpsuKByX5qZE+1C0zmrFj+oXW9iX14A5tU5Lntf522QLl3ZYy7KLpeT3K+dVWX8zvTvDFXUbMjVhn6JGHxkiAd+bIYQu/ONJOtgf5Prg2Hcdw3yT3b2x/Ksk7R4p1ZsrV3xX7B2jev6E2o5vNqK4+kOSvG9srg83HtIyYG7HO0CMPbR4p+DtTOiNX7E73wbjz+GQrCe5I8tqUISFDayeMK0b8Jd/T2n7/AGVenzKQdsWu+ujqha1EeskElXkZMTdanaFHHhorAR5OmbrT9OiRYrWbdk9K8rEkL0iZBjeUs2ecmYylPX7pyoHK/dA6cebx0ZRO5hWPTPK4kSvyMmJutDpDjzy0ecTgV7W2v2ukOH8wI9YZKWP7PpYybu7dKQNQn1Ur5bYecdpN60+PeOxOaW1/dqByP7dOnHm9OGUox4rfG7kuTRXz+Rl2ZsOUdWYZhj5ek+ehMStt+8PeNVKc25P88FF+XXfWrL83yR/Xs6Avp/SrXZwyCX0eO1vbN4947Nrzgw8MVO6BdeLM69qsvjq3O8lPjlyRlxFzUVPWGXrkoTET4Jdb2yeNGOuG2ix6TpJr5nj+1iTnpPQt/VtNnues85p7rrN/Q2ofq1sHKveW1vbJC5R1cSuhXpTVU7zGsIyYi5iyztAjD42ZAKce63QoZezPd6RcRLgoZaWIL83x2ocn+WDKmK213DlhQm8nqu0DlbtjwC/kTVl9MeKMJD878mc8dsxX1Xrb5/E7S64zyzD08Zo8D42ZAIf8snVxuJ7Rvbg2fU9LWQThh1LGlL01ZTjCrGPxyhy56MBa73/nyF/0pnsMVG67nBsXLO/lSb7Q2L5wgi/5MmIOdfaxM0ztqHlozAR4xjpt8Sldl+Tv69nD+SmXwnenrI7SHpbw0jV+NdoXEE4fuUm/Zr/FAk5fJ05XtyX5rcb2qem2dNVGidnXlHWGHnlozAR4Vmv76mPswHwkyXNz5OjwB2b2dKv2QOQfGPG9tY/V2QOV2+7nvGqAMl+f1eMLfymrB3GPYRkx+5iyztAjD42ZAB/b+PehJO86Rg/QnyX5l9bfvnvG89rPefSI76k98HnPAGXubCX2TyX5/ADlfj2rl9janrJiyZiWEbOPKesMPfLQWAlwT8p0rhXvTVnK6Vj1kXX6DZIybOb6xva3pixYOYaPZvXFm4cm+c4Fy3xG6/N+z4Dv9+0p91ZZ8ZyMM/Nn2TG7mrLO0CMPjZEAT0gZhNx06TF+oO5obX9xxnMOpUyza7ow41ztPpzSP5lWM6+vbSmTw5teO/B7bi5asDXTXOVbRswupqwz9MhDYyTAl2b1ZPV3J/m7kXZyb8rV3kX3o7k01MGs3Tf2siRfaWw/LN3utTHLuSkr2rbty+qZD89MuYNYHxcl+bbG9vsy3PS65q9r83M+P+PfGmEZMbuass7QMQ8NmQBPTBlG0jxTOZB+yy7Na0vKFcF/WKD588SsvjhweavZ0nRzyhSspouT/ESPuJtrAn9XZk9Juy6rx7xtSvLnKVevu3h26zM52DpzGlJz0YJNM47V8RKziynrDAvkoUUWInxySr9V8/V3pPuE9a4Lor4gqxfL/NN0m3P8tJSl1pvveb2+tk058g5th+rp9rzj9R6XskDjevd3OCHlhkjNWDfX971eM2p7yn002nMw50l+ay1OOo83Ze35n3uP8ZhjLYk/ZZ1Zy2dy/C+IulAemudmJCfVpHRObW68MkeuNLxy274f6bHziyTA5uNDKSsqPyblTmkn1j6ieyX53vqluHJGhXzunO/z5JTb77Xj3pgyUPe8lLF722oFf0DKQOzLUm5a3n7d0SrzvTP7XsBX1l+53fVsYGvKLQIeUc84Pj/jNa+Zs/9pkWR0Rta+7ePeYzzmmDdFmrLOHM8JcLQ8NNQ9P/dn/WXLm82zRe4L/NMpQyIWfc9fqWV1PdV+9QCxb8r607m2J/nLBWIcTLltaN+68JSOx+blEyfAoWKOfV/gKevMFAnwWLsvcN88NEjgD9b+tK79U4veGH1X7Qf8RI/3fEeSN2exmRZ7UtYc6xr76pS5xzs6xDov5V7GXeL8RVYPBZgiAZ6SMuVoygQ4RMwpbow+dZ25qyXATnloS4edP5wyufvW2g/1hXpqvr+ejg8xqLaPzyX5jfr49pSlsR5Uv/S76unySbWJe6A2Oa6uzZG3Z/aQly7eXx/3Txno+oiUW1furE3urfWYXVv7cN6XsjLwNT1ivSPlStZDUgZ4nlub+KfVL8VNKeMHr0mZ+nd5Zs97HtsNtX/rt4/zmBuhzhxvjtU8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASf4fJ6JYBxmOptUAAAAASUVORK5CYII=",zo="map-card-autogenerated-config-get",wo="map-card-room-config-get",Ao="map-card-service-call-get",Eo="ll-custom",So="dreame_vacuum_card",Po="cleaning",Co="segment_cleaning",Mo="zoned_cleaning",To=[Po,Co,Mo,"spot_cleaning","returning"],Ro=[Po,Co,Mo,"paused"],jo=["docked","idle","charging","charging_completed"],$o={run_immediately:!0,selection_type:fo[fo.ROOM],repeats_type:bo[bo.NONE]},No=[{value:"",label:"Auto"},{value:"bg",label:"Bulgarian"},{value:"ca",label:"Catalan"},{value:"cs",label:"Czech"},{value:"da",label:"Danish"},{value:"de",label:"German"},{value:"el",label:"Greek"},{value:"en",label:"English"},{value:"es",label:"Spanish"},{value:"fi",label:"Finnish"},{value:"fr",label:"French"},{value:"he",label:"Hebrew"},{value:"hu",label:"Hungarian"},{value:"is",label:"Icelandic"},{value:"it",label:"Italian"},{value:"lv",label:"Latvian"},{value:"nb-NO",label:"Norwegian Bokmål"},{value:"nl",label:"Dutch"},{value:"pl",label:"Polish"},{value:"pt",label:"Portuguese"},{value:"pt-BR",label:"Brazilian Portuguese"},{value:"ro",label:"Romanian"},{value:"ru",label:"Russian"},{value:"sk",label:"Slovak"},{value:"sv",label:"Swedish"},{value:"tr",label:"Turkish"},{value:"uk",label:"Ukrainian"},{value:"zh",label:"Chinese (Simplified)"},{value:"zh-Hant",label:"Chinese (Traditional)"}];let Io=class extends ce{constructor(){super(...arguments),this._computeLabel=e=>{const t=`editor.label.${e.name}`;return this._localize(t)},this._computeHelper=e=>{if("entity"===e.name||"camera"===e.name)return this._localize(`editor.helper.${e.name}`)},this._valueChanged=e=>{if(!this._config)return;const t=e.detail.value,a={...this._config,entity:t.entity??this._config.entity,map_source:t.map_source??this._config.map_source,show_title:t.display?.show_title,appearance:"minimal"===t.display?.appearance?"minimal":void 0,language:t.display?.language||void 0,map_locked:t.map_behavior?.map_locked,two_finger_pan:t.map_behavior?.two_finger_pan,clean_selection_on_start:t.map_behavior?.clean_selection_on_start,robot_overlay:!!t.map_behavior?.robot_overlay||void 0};void 0===a.robot_overlay&&delete a.robot_overlay;const i=a.map_source?.camera;this.hass&&i&&!a.calibration_source&&"calibration_points"in(this.hass.states[i]?.attributes??{})&&(a.calibration_source={camera:!0}),this._config=a,fe(this,"config-changed",{config:this._config})}}setConfig(e){this._config=e}render(){if(!this.hass||!this._config)return q``;const e={entity:this._config.entity??"",map_source:this._config.map_source??{camera:""},display:{show_title:this._config.show_title??!1,appearance:this._config.appearance??"premium",language:this._config.language??""},map_behavior:{map_locked:this._config.map_locked??!1,two_finger_pan:this._config.two_finger_pan??!1,clean_selection_on_start:this._config.clean_selection_on_start??!0,robot_overlay:this._config.robot_overlay??!1}};return q`
            <ha-form
                .hass=${this.hass}
                .data=${e}
                .schema=${(e=>[{name:"entity",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"map_source",type:"expandable",title:e("editor.section.map_source"),expanded:!0,schema:[{name:"camera",required:!0,selector:{entity:{domain:["camera","image"]}}}]},{name:"display",type:"expandable",title:e("editor.section.display"),schema:[{name:"show_title",selector:{boolean:{}}},{name:"appearance",selector:{select:{mode:"dropdown",options:[{value:"premium",label:e("editor.option.appearance_premium")},{value:"minimal",label:e("editor.option.appearance_minimal")}]}}},{name:"language",selector:{select:{mode:"dropdown",options:No.map(e=>({value:e.value,label:e.label}))}}}]},{name:"map_behavior",type:"expandable",title:e("editor.section.map_behavior"),schema:[{name:"map_locked",selector:{boolean:{}}},{name:"two_finger_pan",selector:{boolean:{}}},{name:"clean_selection_on_start",selector:{boolean:{}}},{name:"robot_overlay",selector:{boolean:{}}}]}])(e=>this._localize(e))}
                .computeLabel=${this._computeLabel}
                .computeHelper=${this._computeHelper}
                @value-changed=${this._valueChanged}
            ></ha-form>
            <div class="yaml-hint">${this._localize("editor.description.text")}</div>
        `}_localize(e){return vo(e,this.hass)}static get styles(){return r`
            ha-form {
                display: block;
                padding: 8px 16px 0;
            }

            .yaml-hint {
                padding: 16px;
                font-size: 12px;
                color: var(--secondary-text-color);
                font-style: italic;
                text-align: center;
            }
        `}};var Lo,Oo;e([ge({attribute:!1})],Io.prototype,"hass",void 0),e([_e()],Io.prototype,"_config",void 0),Io=e([ue(ko)],Io),function(e){e.CLEANING_START="cleaning.start",e.INTERNAL_VARIABLE_SET="internal_variable.set",e.MAP_MODE_NEXT="map_mode.next",e.MAP_MODE_PREVIOUS="map_mode.previous",e.MAP_MODE_SET="map_mode.set",e.REPEATS_DECREMENT="repeats.decrement",e.REPEATS_INCREMENT="repeats.increment",e.REPEATS_SET="repeats.set",e.SELECTION_CLEAR="selection.clear"}(Lo||(Lo={})),function(e){e.SELECTED="selected",e.UNSELECTED="unselected"}(Oo||(Oo={}));class Do{constructor(e){this.id=-1,this.nativePointer=e,this.pageX=e.pageX,this.pageY=e.pageY,this.clientX=e.clientX,this.clientY=e.clientY,self.Touch&&e instanceof Touch?this.id=e.identifier:Vo(e)&&(this.id=e.pointerId)}getCoalesced(){if("getCoalescedEvents"in this.nativePointer){const e=this.nativePointer.getCoalescedEvents().map(e=>new Do(e));if(e.length>0)return e}return[this]}}const Vo=e=>"pointerId"in e,Uo=e=>"changedTouches"in e,Ko=()=>{};class Fo{constructor(e,{start:t=()=>!0,move:a=Ko,end:i=Ko,rawUpdates:n=!1,avoidPointerEvents:o=!1}={}){this._element=e,this.startPointers=[],this.currentPointers=[],this._excludeFromButtonsCheck=new Set,this._pointerStart=e=>{if(Vo(e)&&0===e.buttons)this._excludeFromButtonsCheck.add(e.pointerId);else if(!(1&e.buttons))return;const t=new Do(e);!this.currentPointers.some(e=>e.id===t.id)&&this._triggerPointerStart(t,e)&&(Vo(e)?((e.target&&"setPointerCapture"in e.target?e.target:this._element).setPointerCapture(e.pointerId),this._element.addEventListener(this._rawUpdates?"pointerrawupdate":"pointermove",this._move),this._element.addEventListener("pointerup",this._pointerEnd),this._element.addEventListener("pointercancel",this._pointerEnd)):(window.addEventListener("mousemove",this._move),window.addEventListener("mouseup",this._pointerEnd)))},this._touchStart=e=>{for(const t of Array.from(e.changedTouches))this._triggerPointerStart(new Do(t),e)},this._move=e=>{if(!(Uo(e)||Vo(e)&&this._excludeFromButtonsCheck.has(e.pointerId)||0!==e.buttons))return void this._pointerEnd(e);const t=this.currentPointers.slice(),a=Uo(e)?Array.from(e.changedTouches).map(e=>new Do(e)):[new Do(e)],i=[];for(const e of a){const t=this.currentPointers.findIndex(t=>t.id===e.id);-1!==t&&(i.push(e),this.currentPointers[t]=e)}0!==i.length&&this._moveCallback(t,i,e)},this._triggerPointerEnd=(e,t)=>{if(!Uo(t)&&1&t.buttons)return!1;const a=this.currentPointers.findIndex(t=>t.id===e.id);if(-1===a)return!1;this.currentPointers.splice(a,1),this.startPointers.splice(a,1),this._excludeFromButtonsCheck.delete(e.id);const i=!("mouseup"===t.type||"touchend"===t.type||"pointerup"===t.type);return this._endCallback(e,t,i),!0},this._pointerEnd=e=>{if(this._triggerPointerEnd(new Do(e),e))if(Vo(e)){if(this.currentPointers.length)return;this._element.removeEventListener(this._rawUpdates?"pointerrawupdate":"pointermove",this._move),this._element.removeEventListener("pointerup",this._pointerEnd),this._element.removeEventListener("pointercancel",this._pointerEnd)}else window.removeEventListener("mousemove",this._move),window.removeEventListener("mouseup",this._pointerEnd)},this._touchEnd=e=>{for(const t of Array.from(e.changedTouches))this._triggerPointerEnd(new Do(t),e)},this._startCallback=t,this._moveCallback=a,this._endCallback=i,this._rawUpdates=n&&"onpointerrawupdate"in window,self.PointerEvent&&!o?this._element.addEventListener("pointerdown",this._pointerStart):(this._element.addEventListener("mousedown",this._pointerStart),this._element.addEventListener("touchstart",this._touchStart),this._element.addEventListener("touchmove",this._move),this._element.addEventListener("touchend",this._touchEnd),this._element.addEventListener("touchcancel",this._touchEnd))}stop(){this._element.removeEventListener("pointerdown",this._pointerStart),this._element.removeEventListener("mousedown",this._pointerStart),this._element.removeEventListener("touchstart",this._touchStart),this._element.removeEventListener("touchmove",this._move),this._element.removeEventListener("touchend",this._touchEnd),this._element.removeEventListener("touchcancel",this._touchEnd),this._element.removeEventListener(this._rawUpdates?"pointerrawupdate":"pointermove",this._move),this._element.removeEventListener("pointerup",this._pointerEnd),this._element.removeEventListener("pointercancel",this._pointerEnd),window.removeEventListener("mousemove",this._move),window.removeEventListener("mouseup",this._pointerEnd)}_triggerPointerStart(e,t){return!!this._startCallback(e,t)&&(this.currentPointers.push(e),this.startPointers.push(e),!0)}}class qo{constructor(e,t){this.x=e,this.y=t}}function Ho(e){e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation()}function Go(e,t,a){let i=0,n=0;return e instanceof MouseEvent&&(i=e.offsetX,n=e.offsetY),window.TouchEvent&&e instanceof TouchEvent&&e.touches&&(i=(e.touches[0].clientX-t.getBoundingClientRect().x)/a,n=(e.touches[0].clientY-t.getBoundingClientRect().y)/a),new qo(i,n)}function Bo(e,t){const a=e.indexOf(t,0);return a>-1&&e.splice(a,1),a}function Zo(e,t){return e?t():null}async function Yo(e){await new Promise(t=>setTimeout(()=>t(),e))}function Xo(e,t,a){const i=Array.from(e.keys());if(1!==i.length||"hass"!==i[0])return!0;const n=e.get("hass");return!n||!t||a.some(e=>!!e&&n.states[e]!==t.states[e])}var Wo,Jo,Qo;!function(e){e.ENTITY_ID="entity_id",e.SELECTION="selection",e.SELECTION_SIZE="selection_size",e.SELECTION_UNWRAPPED="selection_unwrapped",e.REPEATS="repeats",e.POINT_X="point_x",e.POINT_Y="point_y"}(Wo||(Wo={})),function(e){e.ENTITY_ID="entity_id",e.VACUUM_ENTITY_ID="vacuum_entity_id",e.ATTRIBUTE="attribute"}(Jo||(Jo={}));class er{constructor(e,t,a,i){this.domain=e,this.service=t,this.serviceData=a,this.target=i}}function tr(e,t){for(const[a,i]of Object.entries(e))"object"==typeof i&&null!==i?tr(i,t):"string"==typeof i&&(e[a]=t(i))}function ar(e,...t){const a=JSON.parse(JSON.stringify(e));let i={};for(const e of t)i={...e,...i};return tr(a,e=>function(e,t){const a=Object.fromEntries(Object.entries(t??{}).map(([e,t])=>[`[[${e}]]`,t])),i=e=>e in a?a[e]:null;return i(e)??function(e,t,a){let i=e;if(Object.keys(t).forEach(e=>{let t=a(e);"object"==typeof t&&(t=JSON.stringify(t)),i=i.replaceAll(e,`${t}`)}),i.endsWith(Qo.JSONIFY)){const e=i.replace(Qo.JSONIFY,"");try{return JSON.parse(e)}catch{return e}}return i}(e,a,i)}(e,i)),a}!function(e){e.JSONIFY="|[[jsonify]]",e.JSONIFY_JINJA="|[[jsonify_jinja]]"}(Qo||(Qo={}));class ir{constructor(e){this.config=e,this.service=e.service,this.serviceData=e.service_data,this.target=e.target,this.evaluateDataAsTemplate=e.evaluate_data_as_template??!1}apply(e,t,a,i){const n=ir.getDefaultVariables(e,t,a);let o,r;this.serviceData&&(o=ar(this.serviceData,n,i)),this.target&&(r=ar(this.target,n,i));const[s="",l=""]=(this.service??"").split(".");return new er(s,l,o,r)}static getDefaultVariables(e,t,a){const i={};return i[Wo.ENTITY_ID]=e,i[Wo.SELECTION]=t,i[Wo.SELECTION_SIZE]=t.length,i[Wo.SELECTION_UNWRAPPED]=JSON.stringify(t).replaceAll("[","").replaceAll("]","").replaceAll('"',""),i[Wo.REPEATS]=a,i[Wo.POINT_X]=this.isPoint(t)?t[0]:"",i[Wo.POINT_Y]=this.isPoint(t)?t[1]:"",i}static isPoint(e){return"number"==typeof e[0]&&2==e.length}}var nr={default_templates:["vacuum_clean_zone","vacuum_clean_segment","vacuum_clean_point","vacuum_goto"],templates:{vacuum_clean_segment:{name:"map_mode.vacuum_clean_segment",icon:"mdi:floor-plan",selection_type:"ROOM",repeats_type:"EXTERNAL",max_repeats:3,max_selections:60,service_call_schema:{service:"dreame_vacuum.vacuum_clean_segment",service_data:{segments:"[[selection]]",repeats:"[[repeats]]",entity_id:"[[entity_id]]"}}},vacuum_clean_zone:{name:"map_mode.vacuum_clean_zone",icon:"mdi:select-drag",selection_type:"MANUAL_RECTANGLE",coordinates_rounding:!0,coordinates_to_meters_divider:1e3,max_selections:20,repeats_type:"EXTERNAL",max_repeats:3,service_call_schema:{service:"dreame_vacuum.vacuum_clean_zone",service_data:{zone:"[[selection]]",repeats:"[[repeats]]",entity_id:"[[entity_id]]"}}},vacuum_clean_zone_predefined:{name:"map_mode.vacuum_clean_zone_predefined",icon:"mdi:vector-selection",selection_type:"PREDEFINED_RECTANGLE",max_selections:20,coordinates_rounding:!0,coordinates_to_meters_divider:1e3,repeats_type:"EXTERNAL",max_repeats:3,service_call_schema:{service:"dreame_vacuum.vacuum_clean_zone",service_data:{zone:"[[selection]]",repeats:"[[repeats]]",entity_id:"[[entity_id]]"}}},vacuum_clean_point:{name:"map_mode.vacuum_clean_point",icon:"mdi:map-marker-plus",selection_type:"MANUAL_POINT",coordinates_rounding:!0,coordinates_to_meters_divider:1e3,repeats_type:"EXTERNAL",max_repeats:3,service_call_schema:{service:"dreame_vacuum.vacuum_clean_spot",service_data:{points:"[[selection]]",repeats:"[[repeats]]",entity_id:"[[entity_id]]"}}},vacuum_clean_point_predefined:{name:"map_mode.vacuum_clean_point_predefined",icon:"mdi:map-marker",selection_type:"PREDEFINED_POINT",coordinates_rounding:!0,coordinates_to_meters_divider:1e3,repeats_type:"EXTERNAL",max_selections:20,max_repeats:3,service_call_schema:{service:"dreame_vacuum.vacuum_clean_spot",service_data:{points:"[[selection]]",repeats:"[[repeats]]",entity_id:"[[entity_id]]"}}},vacuum_goto:{name:"map_mode.vacuum_goto",icon:"mdi:map-marker-radius",selection_type:"MANUAL_POINT",coordinates_rounding:!0,coordinates_to_meters_divider:1e3,repeats_type:"NONE",max_repeats:0,max_selections:1,service_call_schema:{service:"dreame_vacuum.vacuum_goto",service_data:{x:"[[point_x]]",y:"[[point_y]]",entity_id:"[[entity_id]]"}}},vacuum_goto_predefined:{name:"map_mode.vacuum_goto_predefined",icon:"mdi:map-marker-multiple",selection_type:"PREDEFINED_POINT",coordinates_rounding:!0,coordinates_to_meters_divider:1e3,repeats_type:"NONE",max_repeats:0,max_selections:1,service_call_schema:{service:"dreame_vacuum.vacuum_goto",service_data:{x:"[[point_x]]",y:"[[point_y]]",entity_id:"[[entity_id]]"}}},vacuum_follow_path:{name:"map_mode.vacuum_follow_path",icon:"mdi:map-marker-path",selection_type:"MANUAL_PATH",coordinates_rounding:!0,coordinates_to_meters_divider:1e3,repeats_type:"NONE",max_repeats:0,max_selections:20,service_call_schema:{service:"dreame_vacuum.vacuum_follow_path",service_data:{points:"[[selection]]",entity_id:"[[entity_id]]"}}}}},or={from_attributes:[{tile_id:"water_volume",attribute:"water_volume",label:"tile.water_volume.label",icon:"mdi:water"},{tile_id:"mop_pad_humidity",attribute:"mop_pad_humidity",label:"tile.mop_pad_humidity.label",icon:"mdi:water-percent"},{tile_id:"cleaned_area",attribute:"cleaned_area",label:"tile.cleaned_area.label",icon:"mdi:ruler-square",unit:"unit.meter_squared_shortcut"},{tile_id:"cleaning_time",attribute:"cleaning_time",label:"tile.cleaning_time.label",icon:"mdi:timer-sand",unit:"unit.minute_shortcut"},{tile_id:"cleaning_count",attribute:"cleaning_count",label:"tile.cleaning_count.label",icon:"mdi:counter",unit:"x"},{tile_id:"total_cleaned_area",attribute:"total_cleaned_area",label:"tile.total_cleaned_area.label",icon:"mdi:set-square",unit:"unit.meter_squared_shortcut"},{tile_id:"cleaning_mode",attribute:"cleaning_mode",label:"tile.cleaning_mode.label",icon:"mdi:vacuum",translation_keys:["sweeping","mopping","sweeping and mopping","mopping after sweeping"]},{tile_id:"tight_mopping",attribute:"tight_mopping",label:"tile.tight_mopping.label",icon:"mdi:heating-coil",translation_keys:["true","false"]},{tile_id:"wetness_level",attribute:"wetness_level",label:"tile.wetness_level.label",icon:"mdi:water-opacity"},{tile_id:"mop_wash_level",attribute:"mop_wash_level",label:"tile.mop_wash_level.label",icon:"mdi:water-opacity",translation_keys:["deep","daily","water saving"]},{tile_id:"auto_empty_mode",attribute:"auto_empty_mode",label:"tile.auto_empty_mode.label",icon:"mdi:delete-empty-outline",translation_keys:["off","standard","high frequency","low frequency"]},{tile_id:"cleaning_route",attribute:"cleaning_route",label:"tile.cleaning_route.label",icon:"mdi:routes",translation_keys:["quick","standard"]},{tile_id:"cleangenius",attribute:"cleangenius",label:"tile.cleangenius.label",icon:"mdi:auto-mode",translation_keys:["off","routine cleaning","deep cleaning"]}]},rr=[{type:"menu",menu_id:"water_volume",icon_id:"water_volume",unique_id_regex:"_water_volume",available_values_attribute:"options",icon:"mdi:water-off",icon_mapping:{low:"mdi:water-minus",medium:"mdi:water",high:"mdi:water-plus"},tap_action:{action:"call-service",service:"select.select_option",service_data:{option:"[[value]]",entity_id:"[[entity_id]]"}}},{type:"menu",menu_id:"mop_pad_humidity",icon_id:"mop_pad_humidity",unique_id_regex:"_mop_pad_humidity",available_values_attribute:"options",icon:"mdi:water-off",icon_mapping:{slightly_dry:"mdi:water-minus",moist:"mdi:water",wet:"mdi:water-plus"},tap_action:{action:"call-service",service:"select.select_option",service_data:{option:"[[value]]",entity_id:"[[entity_id]]"}}},{type:"menu",menu_id:"cleaning_mode",icon_id:"cleaning_mode",unique_id_regex:"cleaning_mode",available_values_attribute:"options",icon:"mdi:hydro-power",icon_mapping:{sweeping:"mdi:broom",mopping:"mdi:cup-water"},tap_action:{action:"call-service",service:"select.select_option",service_data:{option:"[[value]]",entity_id:"[[entity_id]]"}}}],sr={map_modes:nr,tiles:or,icons:rr},lr=Object.freeze({__proto__:null,default:sr,icons:rr,map_modes:nr,tiles:or});class cr{static{this.TASSHACK_DREAME_VACUUM_PLATFORM="Dreame"}static{this.TEMPLATES=new Map([[cr.TASSHACK_DREAME_VACUUM_PLATFORM,lr]])}static getPlatformsWithDefaultCalibration(){return[cr.TASSHACK_DREAME_VACUUM_PLATFORM]}static getPlatforms(){return Array.from(cr.TEMPLATES.keys())}static getPlatformName(e){return e?"Tasshack/dreame-vacuum"===e||"tasshackDreameVacuum"===e?cr.TASSHACK_DREAME_VACUUM_PLATFORM:e:cr.TASSHACK_DREAME_VACUUM_PLATFORM}static isValidModeTemplate(e,t){return void 0!==t&&Object.keys(this.getPlatformTemplate(e).map_modes.templates).includes(t)}static getModeTemplate(e,t){return this.getPlatformTemplate(e).map_modes.templates[t]}static generateDefaultModes(e){return this.getPlatformTemplate(e).map_modes.default_templates.map(e=>({template:e}))}static getCalibration(e){return this.getPlatformTemplate(cr.getPlatformName(e)).calibration_points}static getVariables(e){return this.getPlatformTemplate(cr.getPlatformName(e)).internal_variables}static getPlatformTemplate(e){return this.TEMPLATES.get(e)??this.TEMPLATES.get(this.TASSHACK_DREAME_VACUUM_PLATFORM)??lr}}class dr{static{this.PREDEFINED_SELECTION_TYPES=[fo.PREDEFINED_RECTANGLE,fo.ROOM,fo.PREDEFINED_POINT]}static _parseEnum(e,t,a,i){if(void 0===t)return a;const n=e[t];return"number"!=typeof n?(dr.debug&&console.warn(`[MapMode] Invalid ${i}: "${t}" — using fallback.`),a):n}static{this.debug=!1}constructor(e,t,a){this.config=t,this.name=t.name??ho("map_mode.invalid",a),this.icon=t.icon??"mdi:help",this.idType=t.id_type,this.selectionType=dr._parseEnum(fo,t.selection_type,fo.PREDEFINED_POINT,"selection_type"),this.maxSelections=t.max_selections??999,this.coordinatesRounding=t.coordinates_rounding??!0,this.coordinatesToMetersDivider=t.coordinates_to_meters_divider??1e3,this.runImmediately=t.run_immediately??!1,this.repeatsType=dr._parseEnum(bo,t.repeats_type,bo.NONE,"repeats_type"),this.maxRepeats=t.max_repeats??1,this.serviceCallSchema=new ir(t.service_call_schema??{}),this.predefinedSelections=t.predefined_selections??[],this.variables=t.variables??{},this._applyTemplateIfPossible(e,t,a),dr.PREDEFINED_SELECTION_TYPES.includes(this.selectionType)||(this.runImmediately=!1)}async getServiceCall(e,t,a,i,n){let o=this._applyData(t,a,i,n);if(this.serviceCallSchema.evaluateDataAsTemplate)try{const t=await async function(e,t,a=5e3){return new Promise((i,n)=>{let o,r=!1;const s=setTimeout(()=>{r||(r=!0,o?.(),n(new Error(`Délai dépassé (${a} ms) lors du rendu du template Jinja`)))},a);e.connection.subscribeMessage(e=>{r||(r=!0,clearTimeout(s),i(e.result),o?.())},{type:"render_template",template:t}).then(e=>{r?e():o=e}).catch(e=>{r||(r=!0,clearTimeout(s),n(e))})})}(e,JSON.stringify(o.serviceData)),a="string"==typeof t?JSON.parse(t):t;tr(a,e=>e.endsWith(Qo.JSONIFY_JINJA)?JSON.parse(e.replace(Qo.JSONIFY_JINJA,"")):e),o={...o,serviceData:a}}catch(e){dr.debug&&console.error("Échec de l'évaluation du template du service",e)}return o}toMapModeConfig(){return{name:this.name,icon:this.icon,run_immediately:this.runImmediately,coordinates_rounding:this.coordinatesRounding,coordinates_to_meters_divider:this.coordinatesToMetersDivider,selection_type:fo[this.selectionType],id_type:this.idType,max_selections:this.maxSelections,repeats_type:bo[this.repeatsType],max_repeats:this.maxRepeats,service_call_schema:JSON.parse(JSON.stringify(this.serviceCallSchema.config)),predefined_selections:this.predefinedSelections,variables:Object.fromEntries(Object.entries(this.variables??{}).map(([e,t])=>[e.slice(2,-2),t]))}}_applyTemplateIfPossible(e,t,a){if(!t.template||!cr.isValidModeTemplate(e,t.template))return;const i=cr.getModeTemplate(e,t.template);!t.name&&i.name&&(this.name=ho(i.name,a)),!t.icon&&i.icon&&(this.icon=i.icon),!t.selection_type&&i.selection_type&&(this.selectionType=dr._parseEnum(fo,i.selection_type,this.selectionType,"selection_type")),!t.id_type&&i.id_type&&(this.idType=i.id_type),!t.max_selections&&i.max_selections&&(this.maxSelections=i.max_selections),void 0===t.coordinates_rounding&&void 0!==i.coordinates_rounding&&(this.coordinatesRounding=i.coordinates_rounding),void 0===t.coordinates_to_meters_divider&&void 0!==i.coordinates_to_meters_divider&&(this.coordinatesToMetersDivider=i.coordinates_to_meters_divider),void 0===t.run_immediately&&void 0!==i.run_immediately&&(this.runImmediately=i.run_immediately),!t.repeats_type&&i.repeats_type&&(this.repeatsType=dr._parseEnum(bo,i.repeats_type,this.repeatsType,"repeats_type")),!t.max_repeats&&i.max_repeats&&(this.maxRepeats=i.max_repeats),!t.service_call_schema&&i.service_call_schema&&(this.serviceCallSchema=new ir(i.service_call_schema))}_applyData(e,t,a,i){return this.serviceCallSchema.apply(e,t,a,{...this.variables,...i})}}function ur(e){const t=new Set;return function(e,t){const a=new Set;return e.entity&&a.add(e.entity),e.map_source.camera&&a.add(e.map_source.camera),e.calibration_source?.entity&&a.add(e.calibration_source.entity),(e.conditions??[]).map(e=>e?.entity).forEach(e=>{e&&a.add(e)}),(e.map_modes??[]).map(a=>new dr(cr.getPlatformName(e.vacuum_platform),a,t)).forEach(e=>function(e){const t=new Set;switch(e.selectionType){case fo.PREDEFINED_RECTANGLE:e.predefinedSelections.map(e=>e).filter(e=>"string"==typeof e.zones).forEach(e=>t.add(e.zones.split(".attributes.")[0]));break;case fo.PREDEFINED_POINT:e.predefinedSelections.map(e=>e).filter(e=>"string"==typeof e.position).forEach(e=>t.add(e.position.split(".attributes.")[0]))}return e.predefinedSelections.filter(e=>e.state_entity).forEach(e=>t.add(e.state_entity)),t}(e).forEach(e=>a.add(e))),a}(e,e.language).forEach(e=>t.add(e)),[...t]}const mr="min-scale",pr="max-scale",gr="locked",_r="no-default-pan",hr="two-finger-pan";function vr(e,t){return t?Math.sqrt((t.clientX-e.clientX)**2+(t.clientY-e.clientY)**2):0}function fr(e,t){return t?{clientX:(e.clientX+t.clientX)/2,clientY:(e.clientY+t.clientY)/2}:e}function br(e,t){return"number"==typeof e?e:e.trimEnd().endsWith("%")?t*parseFloat(e)/100:parseFloat(e)}let yr;function kr(){return yr||(yr=document.createElementNS("http://www.w3.org/2000/svg","svg"))}function xr(){return kr().createSVGMatrix()}function zr(){return kr().createSVGPoint()}const wr=.01;class Ar extends HTMLElement{static get observedAttributes(){return[mr,pr,_r,hr,gr]}constructor(){super(),this._transform=xr(),this._enablePan=!0,this._locked=!1,this._twoFingerPan=!1,this._onWheelHandler=e=>this._onWheel(e),this._mutationObserver=new MutationObserver(()=>this._stageElChange()),this._mutationObserver.observe(this,{childList:!0});const e=new Fo(this,{start:(t,a)=>!(a.target.classList.contains("draggable")&&e.currentPointers.length<2||2===e.currentPointers.length||!this._positioningEl||this.locked||((this.enablePan||1==e.currentPointers.length||a instanceof PointerEvent&&"mouse"==a.pointerType)&&(this.enablePan=!0),0)),move:t=>{this.enablePan&&this._onPointerMove(t,e.currentPointers)},end:(t,a,i)=>(this.twoFingerPan&&1==e.currentPointers.length&&(this.enablePan=!1),Ho(a),!1)});this._pointerTracker=e,this.addEventListener("wheel",this._onWheelHandler)}disconnectedCallback(){this._mutationObserver?.disconnect(),this._mutationObserver=void 0,this._pointerTracker?.stop(),this._pointerTracker=void 0,this.removeEventListener("wheel",this._onWheelHandler)}attributeChangedCallback(e,t,a){e===mr&&this.scale<this.minScale&&this.setTransform({scale:this.minScale}),e===pr&&this.scale>this.maxScale&&this.setTransform({scale:this.maxScale}),e===_r&&(this.enablePan=!("1"==a||"true"==a)),e===hr&&("1"==a||"true"==a?(this.twoFingerPan=!0,this.enablePan=!1):(this.twoFingerPan=!1,this.enablePan=!0)),e===gr&&(this.locked="1"==a||"true"==a)}get minScale(){const e=this.getAttribute(mr);if(!e)return wr;const t=parseFloat(e);return Number.isFinite(t)?Math.max(wr,t):wr}set minScale(e){e&&this.setAttribute(mr,String(e))}get maxScale(){const e=this.getAttribute(pr);if(!e)return 100;const t=parseFloat(e);return Number.isFinite(t)?Math.min(100,t):100}set maxScale(e){e&&this.setAttribute(pr,String(e))}set enablePan(e){this._enablePan=e,this._enablePan?this._enablePan&&"none"!=this.style.touchAction&&(this.style.touchAction="none"):this.style.touchAction="pan-y pan-x"}get enablePan(){return this._enablePan}set locked(e){this._locked=e}get locked(){return this._locked}set twoFingerPan(e){this._twoFingerPan=e}get twoFingerPan(){return this._twoFingerPan}connectedCallback(){this._stageElChange()}get x(){return this._transform.e}get y(){return this._transform.f}get scale(){return this._transform.a}scaleTo(e,t={}){let{originX:a=0,originY:i=0}=t;const{relativeTo:n="content",allowChangeEvent:o=!1}=t,r="content"===n?this._positioningEl:this;if(!r||!this._positioningEl)return void this.setTransform({scale:e,allowChangeEvent:o});const s=r.getBoundingClientRect();if(a=br(a,s.width),i=br(i,s.height),"content"===n)a+=this.x,i+=this.y;else{const e=this._positioningEl.getBoundingClientRect();a-=e.left,i-=e.top}this._applyChange({allowChangeEvent:o,originX:a,originY:i,scaleDiff:e/this.scale})}setTransform(e={}){const{scale:t=this.scale,allowChangeEvent:a=!1}=e;let{x:i=this.x,y:n=this.y}=e;if(!this._positioningEl)return void this._updateTransform(t,i,n,a);const o=this.getBoundingClientRect(),r=this._positioningEl.getBoundingClientRect();if(!o.width||!o.height)return void this._updateTransform(t,i,n,a);let s=zr();s.x=r.left-o.left,s.y=r.top-o.top;let l=zr();l.x=r.width+s.x,l.y=r.height+s.y;const c=xr().translate(i,n).scale(t).multiply(this._transform.inverse());s=s.matrixTransform(c),l=l.matrixTransform(c),s.x>o.width?i+=o.width-s.x:l.x<0&&(i+=-l.x),s.y>o.height?n+=o.height-s.y:l.y<0&&(n+=-l.y),this._updateTransform(t,i,n,a)}_updateTransform(e,t,a,i){if(!(e<this.minScale)&&!(e>this.maxScale)&&(e!==this.scale||t!==this.x||a!==this.y)&&(this._transform.e=t,this._transform.f=a,this._transform.d=this._transform.a=e,this.style.setProperty("--x",this.x+"px"),this.style.setProperty("--y",this.y+"px"),this.style.setProperty("--scale",this.scale+""),i)){const e=new Event("change",{bubbles:!0});this.dispatchEvent(e)}}_stageElChange(){this._positioningEl=void 0,0!==this.children.length&&(this._positioningEl=this.children[0],this.children.length>1&&console.warn("<pinch-zoom> must not have more than one child."),this.setTransform({allowChangeEvent:!0}))}_onWheel(e){if(!this._positioningEl||this.locked)return;e.preventDefault();const t=this._positioningEl.getBoundingClientRect();let{deltaY:a}=e;const{ctrlKey:i,deltaMode:n}=e;1===n&&(a*=15);const o=1-a/(i?100:300);this._applyChange({scaleDiff:o,originX:e.clientX-t.left,originY:e.clientY-t.top,allowChangeEvent:!0})}_onPointerMove(e,t){if(!this._positioningEl)return;const a=this._positioningEl.getBoundingClientRect(),i=fr(e[0],e[1]),n=fr(t[0],t[1]),o=i.clientX-a.left,r=i.clientY-a.top,s=vr(e[0],e[1]),l=vr(t[0],t[1]),c=s?l/s:1;this._applyChange({originX:o,originY:r,scaleDiff:c,panX:n.clientX-i.clientX,panY:n.clientY-i.clientY,allowChangeEvent:!0})}_applyChange(e={}){const{panX:t=0,panY:a=0,originX:i=0,originY:n=0,scaleDiff:o=1,allowChangeEvent:r=!1}=e,s=xr().translate(t,a).translate(i,n).translate(this.x,this.y).scale(o).translate(-i,-n).scale(this.scale);this.setTransform({allowChangeEvent:r,scale:s.a,x:s.e,y:s.f})}}customElements.define("pinch-zoom",Ar);class Er{constructor(e){this._context=e}get variables(){return{}}static findTopLeft(e){const t=[...e].sort((e,t)=>e[1]-t[1])[0],a=e.indexOf(t),i=e[(a+1)%4],n=e[(a+3)%4],o=Er.calcAngle(t,i)<Er.calcAngle(t,n)?i:n;return o[0]<t[0]?o:t}static calcAngle(e,t){let a=Math.atan2(t[1]-e[1],t[0]-e[0]);return a>Math.PI/2&&(a=Math.PI-a),a}static _reverse([e,t,a,i]){return[e,i,a,t]}scaled(e){return e/this._context.scale()}realScaled(e){return e/this._context.realScale()}realScaled2(e){return e*this._context.realScale()}realScaled2Point(e){return[this.realScaled2(e[0]),this.realScaled2(e[1])]}realScaledPoint(e){return[this.realScaled(e[0]),this.realScaled(e[1])]}update(){this._context.update(),this._context.selectionChanged()}localize(e){return this._context.localize(e)}getMousePosition(e){return this._context.mousePositionCalculator(e)}vacuumToRealMap(e,t){const a=this._context.coordinatesConverter()?.vacuumToMap(e,t);if(!a)throw Error("Missing calibration");return a}vacuumToScaledMap(e,t){return this.realScaled2Point(this.vacuumToRealMap(e,t))}scaledMapToVacuum(e,t){const[a,i]=this.realScaledPoint([e,t]);return this.realMapToVacuum(a,i)}realMapToVacuum(e,t){const a=this._context.coordinatesConverter()?.mapToVacuum(e,t);if(!a)throw Error("Missing calibration");return this._context.roundMap(a)}renderIcon(e,t,a){const i=e?this.vacuumToScaledMap(e.x,e.y):[];return H`${Zo(null!=e&&i.length>0,()=>H`
                <foreignObject class="icon-foreign-object"
                               style="--x-icon: ${i[0]}px; --y-icon: ${i[1]}px;"
                               x="${i[0]}px" y="${i[1]}px" width="36px" height="36px">
                    <body xmlns="http://www.w3.org/1999/xhtml">
                      <div class="map-icon-wrapper ${a} clickable" @click="${t}" >
                          <ha-icon icon="${e?.name}" style="background: transparent;"></ha-icon>
                      </div>
                    </body>
                </foreignObject>
            `)}`}renderLabel(e,t){const a=e?this.vacuumToScaledMap(e.x,e.y):[];return H`${Zo(null!=e&&a.length>0,()=>{const i=a[0]+this.scaled(e?.offset_x??0),n=a[1]+this.scaled(e?.offset_y??0),o=e?.text??"";return H`
                    <foreignObject
                        x="${i}"
                        y="${n}"
                        width="${200}"
                        height="${40}"
                        class="${t}-fo"
                        style="overflow: visible; pointer-events: none;
                               transform: translate(-${100}px, -${20}px)
                                          scale(${1/this._context.scale()});">
                        <body xmlns="http://www.w3.org/1999/xhtml"
                              style="margin:0; padding:0; background:none; display:flex;
                                     justify-content:center; align-items:center;
                                     width:${200}px; height:${40}px;">
                            <div class="label-badge ${t}">${o}</div>
                        </body>
                    </foreignObject>
                `})}`}vacuumToMapRect([e,t,a,i]){const n=[e,t],o=[a,t],r=[a,i],s=[e,i],l=this.vacuumToScaledMap(e,t),c=this.vacuumToScaledMap(a,t),d=this.vacuumToScaledMap(a,i),u=this.vacuumToScaledMap(e,i),m=[n,o,r,s,n,o,r,s],p=[l,c,d,u,l,c,d,u],g=[l,c,d,u],_=p.indexOf(Er.findTopLeft(g)),h=p.slice(_,_+4),v=this._isCounterClockwise(h),f=m.slice(_,_+4);return v?[Er._reverse(h),Er._reverse(f)]:[h,f]}_isCounterClockwise(e){let t=0;return e.forEach((a,i)=>t+=(e[(i+1)%4][0]-a[0])*(e[(i+1)%4][1]+a[1])),t<0}static get styles(){return r`
            .icon-foreign-object {
                overflow: visible;
                pointer-events: none;
            }

            .map-icon-wrapper {
                position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
            }
        `}}var Sr;!function(e){e[e.NONE=0]="NONE",e[e.RESIZE=1]="RESIZE",e[e.MOVE=2]="MOVE"}(Sr||(Sr={}));class Pr extends Er{constructor(e,t,a,i,n,o){super(o),this._id=n,this._dragMode=Sr.NONE,this._vacRect=this._toVacuumFromDimensions(e,t,a,i),this._vacRectSnapshot=this._vacRect}static _toPoints(e){const t=e.filter(e=>!isNaN(e[0])&&!isNaN(e[1])).map(e=>e.join(", ")).join(" ");return t}render(){const e=this._vacRect,t=this.vacuumToMapRect(e)[0],a=t[0],i=t[2],n=t[3],o=Pr.calcAngle(t[0],t[3]);return H`
            <g class="manual-rectangle-wrapper ${this.isSelected()?"selected":""}"
               style="--x-resize:${i[0]}px;
                      --y-resize:${i[1]}px;
                      --x-delete:${n[0]}px;
                      --y-delete:${n[1]}px;
                      --x-description:${a[0]}px;
                      --y-description:${a[1]}px;
                      --angle-description: ${o}rad;">
                <polygon class="manual-rectangle draggable movable"
                         @mousedown="${e=>this._startDrag(e)}"
                         @mousemove="${e=>this._drag(e)}"
                         @mouseup="${e=>this._endDrag(e)}"
                         @touchstart="${e=>this._startDrag(e)}"
                         @touchmove="${e=>this._drag(e)}"
                         @touchend="${e=>this._endDrag(e)}"
                         @touchleave="${e=>this._endDrag(e)}"
                         @touchcancel="${e=>this._endDrag(e)}"
                         points="${Pr._toPoints(t)}">
                </polygon>
                <g class="manual-rectangle-description">
                    <text>
                        ${this._id} ${this._getDimensions()}
                    </text>
                </g>
                <circle class="manual-rectangle-delete-circle clickable"
                        @mouseup="${e=>this._delete(e)}"></circle>
                <path class="manual-rectangle-delete-icon"
                      d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z">
                </path>
                <circle class="manual-rectangle-resize-circle draggable resizer"
                        @mousedown="${e=>this._startDrag(e)}"
                        @mousemove="${e=>this._drag(e)}"
                        @mouseup="${e=>this._endDrag(e)}"
                        @touchstart="${e=>this._startDrag(e)}"
                        @touchmove="${e=>this._drag(e)}"
                        @touchend="${e=>this._endDrag(e)}"
                        @touchleave="${e=>this._endDrag(e)}"
                        @touchcancel="${e=>this._endDrag(e)}">
                </circle>
                <path class="manual-rectangle-resize-icon"
                      d="M13,21H21V13H19V17.59L6.41,5H11V3H3V11H5V6.41L17.59,19H13V21Z">
                </path>
            </g>
        `}isSelected(){return null!=this._selectedElement}externalDrag(e){this._drag(e)}toVacuum(e=null){const[t,a,i,n]=this._vacRect,o=[Math.min(t,i),Math.min(a,n),Math.max(t,i),Math.max(a,n)];return null!=e?[...o,e]:o}_getDimensions(){const[e,t,a,i]=this.toVacuum(),n=Math.abs(a-e),o=Math.abs(i-t),r=this._context.coordinatesToMetersDivider();if(-1===r)return"";const s=e=>(e/r).toFixed(1);return`${s(n)}${this.localize("unit.meter_shortcut")} x ${s(o)}${this.localize("unit.meter_shortcut")}`}_startDrag(e){if(window.TouchEvent&&e instanceof TouchEvent&&e.touches.length>1)return;const t=e.target;if(!t?.classList?.contains("draggable"))return;if(!t.parentElement?.classList.contains("manual-rectangle-wrapper"))return;if(!e.target.parentElement)return;Ho(e);const a=e.target;a.classList.contains("movable")?this._dragMode=Sr.MOVE:a.classList.contains("resizer")?this._dragMode=Sr.RESIZE:this._dragMode=Sr.NONE,this._selectedElement=e.target.parentElement,this._vacRectSnapshot=[...this._vacRect];const i=this.getMousePosition(e);this._startPointSnapshot=this.scaledMapToVacuum(i.x,i.y),this.update()}_drag(e){if(!(window.TouchEvent&&e instanceof TouchEvent&&e.touches.length>1)&&this._selectedElement){Ho(e);const t=this.getMousePosition(e);if(t){const e=this.scaledMapToVacuum(t.x,t.y),a=e[0]-this._startPointSnapshot[0],i=e[1]-this._startPointSnapshot[1];switch(this._dragMode){case Sr.MOVE:this._vacRect=[this._vacRectSnapshot[0]+a,this._vacRectSnapshot[1]+i,this._vacRectSnapshot[2]+a,this._vacRectSnapshot[3]+i],this._setup(this.vacuumToMapRect(this._vacRect)[0]);break;case Sr.RESIZE:const e=this.vacuumToMapRect(this._vacRectSnapshot)[1][0],t=[...this._vacRect];e[0]===this._vacRectSnapshot[0]?this._vacRect[2]=this._vacRectSnapshot[2]+a:this._vacRect[0]=this._vacRectSnapshot[0]+a,e[1]===this._vacRectSnapshot[1]?this._vacRect[3]=this._vacRectSnapshot[3]+i:this._vacRect[1]=this._vacRectSnapshot[1]+i,Math.sign(this._vacRect[0]-this._vacRect[2])==Math.sign(t[0]-t[2])&&Math.sign(this._vacRect[1]-this._vacRect[3])==Math.sign(t[1]-t[3])||(this._vacRect=t),this._setup(this.vacuumToMapRect(this._vacRect)[0]);case Sr.NONE:}}}}_setup(e){this._selectedElement?.children?.item(0)?.setAttribute("points",Pr._toPoints(e));const t=e[0],a=e[2],i=e[3],n=Pr.calcAngle(e[0],e[3]);this._selectedElement?.style?.setProperty("--x-resize",a[0]+"px"),this._selectedElement?.style?.setProperty("--y-resize",a[1]+"px"),this._selectedElement?.style?.setProperty("--x-delete",i[0]+"px"),this._selectedElement?.style?.setProperty("--y-delete",i[1]+"px"),this._selectedElement?.style?.setProperty("--x-description",t[0]+"px"),this._selectedElement?.style?.setProperty("--y-description",t[1]+"px"),this._selectedElement?.style?.setProperty("--angle-description",n+"rad")}_endDrag(e){Ho(e),this._selectedElement=null,this.update()}_delete(e){Ho(e);const t=Bo(this._context.selectedManualRectangles(),this);if(t>-1){for(let e=t;e<this._context.selectedManualRectangles().length;e++)this._context.selectedManualRectangles()[e]._id=(e+1).toString();be("selection"),this.update()}}_toVacuumFromDimensions(e,t,a,i){const n=this.realScaled(e),o=this.realScaled(t),r=this.realScaled(a),s=this.realScaled(i),l=this.realMapToVacuum(n,o),c=this.realMapToVacuum(n+r,o+s),d=Math.min(l[0],c[0]),u=Math.max(l[0],c[0]);return[d,Math.min(l[1],c[1]),u,Math.max(l[1],c[1])]}static get styles(){return r`
            .resizer {
                cursor: nwse-resize;
            }

            .movable {
                cursor: move;
            }

            .manual-rectangle-wrapper {
            }

            .manual-rectangle-wrapper.selected {
            }

            .manual-rectangle {
                stroke: var(--map-card-internal-manual-rectangle-line-color);
                stroke-linejoin: round;
                stroke-dasharray:
                    calc(var(--map-card-internal-manual-rectangle-line-segment-line) / var(--map-scale)),
                    calc(var(--map-card-internal-manual-rectangle-line-segment-gap) / var(--map-scale));
                fill: var(--map-card-internal-manual-rectangle-fill-color);
                stroke-width: calc(var(--map-card-internal-manual-rectangle-line-width) / var(--map-scale));
            }

            .manual-rectangle-wrapper.selected > .manual-rectangle {
                stroke: var(--map-card-internal-manual-rectangle-line-color-selected);
                fill: var(--map-card-internal-manual-rectangle-fill-color-selected);
            }

            .manual-rectangle-description {
                transform: translate(
                        calc(
                            var(--x-description) + var(--map-card-internal-manual-rectangle-description-offset-x) /
                                var(--map-scale)
                        ),
                        calc(
                            var(--y-description) + var(--map-card-internal-manual-rectangle-description-offset-y) /
                                var(--map-scale)
                        )
                    )
                    rotate(var(--angle-description));
                font-size: calc(var(--map-card-internal-manual-rectangle-description-font-size) / var(--map-scale));
                fill: var(--map-card-internal-manual-rectangle-description-color);
                background: transparent;
            }

            .manual-rectangle-delete-circle {
                r: calc(var(--map-card-internal-manual-rectangle-delete-circle-radius) / var(--map-scale));
                cx: var(--x-delete);
                cy: var(--y-delete);
                stroke: var(--map-card-internal-manual-rectangle-delete-circle-line-color);
                fill: var(--map-card-internal-manual-rectangle-delete-circle-fill-color);
                stroke-width: calc(
                    var(--map-card-internal-manual-rectangle-delete-circle-line-width) / var(--map-scale)
                );
            }

            .manual-rectangle-delete-icon {
                fill: var(--map-card-internal-manual-rectangle-delete-icon-color);
                transform: translate(
                        calc(var(--x-delete) - 8.5px / var(--map-scale)),
                        calc(var(--y-delete) - 8.5px / var(--map-scale))
                    )
                    scale(calc(0.71 / var(--map-scale)));
                pointer-events: none;
            }

            .manual-rectangle-wrapper.selected > .manual-rectangle-delete-circle {
                stroke: var(--map-card-internal-manual-rectangle-delete-circle-line-color-selected);
                fill: var(--map-card-internal-manual-rectangle-delete-circle-fill-color-selected);
                opacity: 50%;
            }

            .manual-rectangle-wrapper.selected > .manual-rectangle-delete-icon {
                fill: var(--map-card-internal-manual-rectangle-delete-icon-color-selected);
                opacity: 50%;
            }

            .manual-rectangle-resize-circle {
                r: calc(var(--map-card-internal-manual-rectangle-resize-circle-radius) / var(--map-scale));
                cx: var(--x-resize);
                cy: var(--y-resize);
                stroke: var(--map-card-internal-manual-rectangle-resize-circle-line-color);
                fill: var(--map-card-internal-manual-rectangle-resize-circle-fill-color);
                stroke-width: calc(
                    var(--map-card-internal-manual-rectangle-resize-circle-line-width) / var(--map-scale)
                );
            }

            .manual-rectangle-resize-icon {
                fill: var(--map-card-internal-manual-rectangle-resize-icon-color);
                transform: translate(
                        calc(var(--x-resize) - 8.5px / var(--map-scale)),
                        calc(var(--y-resize) - 8.5px / var(--map-scale))
                    )
                    scale(calc(0.71 / var(--map-scale)));
                pointer-events: none;
            }

            .manual-rectangle-wrapper.selected > .manual-rectangle-resize-circle {
                stroke: var(--map-card-internal-manual-rectangle-resize-circle-line-color-selected);
                fill: var(--map-card-internal-manual-rectangle-resize-circle-fill-color-selected);
                opacity: 50%;
            }

            .manual-rectangle-wrapper.selected > .manual-rectangle-resize-icon {
                fill: var(--map-card-internal-manual-rectangle-resize-icon-color-selected);
                opacity: 50%;
            }
        `}}class Cr{constructor(e){this.scale=e.scale,this.realScale=e.realScale,this.mousePositionCalculator=e.mousePositionCalculator,this.update=e.update,this.selectionChanged=e.selectionChanged,this.coordinatesConverter=e.coordinatesConverter,this.selectedManualRectangles=e.selectedManualRectangles,this.selectedPredefinedRectangles=e.selectedPredefinedRectangles,this.selectedRooms=e.selectedRooms,this.selectedPredefinedPoint=e.selectedPredefinedPoint,this.roundingEnabled=e.roundingEnabled,this.coordinatesToMetersDivider=e.coordinatesToMetersDivider,this.maxSelections=e.maxSelections,this.runImmediately=e.runImmediately,this.localize=e.localize,this.getState=e.getState,this.toggleEntity=e.toggleEntity,this.getCurrentMode=e.getCurrentMode,this.activateRoomMode=e.activateRoomMode,this.activeTab=e.activeTab}roundMap([e,t]){return this.roundingEnabled()?[Math.round(e),Math.round(t)]:[e,t]}}class Mr extends Er{constructor(e,t,a){super(a),this._x=e,this._y=t}}class Tr extends Mr{constructor(e,t,a){super(e,t,a)}render(){return H`
            <g class="manual-point-wrapper" style="--x-point:${this._x}px; --y-point:${this._y}px;">
                <circle class="manual-point"></circle>
            </g>
        `}imageX(){return this.realScaled(this._x)}imageY(){return this.realScaled(this._y)}toVacuum(e=null){const[t,a]=this.realMapToVacuum(this.imageX(),this.imageY());return null===e?[t,a]:[t,a,e]}static get styles(){return r`
            .manual-point-wrapper {
                stroke: var(--map-card-internal-manual-point-line-color);
                stroke-width: calc(var(--map-card-internal-manual-point-line-width) / var(--map-scale));
                --radius: calc(var(--map-card-internal-manual-point-radius) / var(--map-scale));
            }

            .manual-point {
                cx: var(--x-point);
                cy: var(--y-point);
                r: var(--radius);
                fill: var(--map-card-internal-manual-point-fill-color);
            }
        `}}class Rr extends Er{constructor(e,t,a){super(a),this.x=e,this.y=t}imageX(){return this.realScaled(this.x)}imageY(){return this.realScaled(this.y)}renderMask(){return H`
            <circle style="r: var(--radius)"
                    cx="${this.x}"
                    cy="${this.y}"
                    fill="black">
            </circle>`}render(){return H`
            <circle class="manual-path-point"
                    cx="${this.x}"
                    cy="${this.y}">
            </circle>`}}class jr extends Er{constructor(e,t){super(t),this.points=e}render(){if(0===this.points.length)return H``;const e=this.points.map(e=>e.x),t=this.points.map(e=>e.y),a=Math.max(...e),i=Math.min(...e),n=Math.max(...t),o=Math.min(...t);return H`
            <g class="manual-path-wrapper">
                <defs>
                    <mask id="manual-path-circles-filter">
                        <rect x="${i}" y="${o}" width="${a-i}" height="${n-o}"
                              fill="white"></rect>
                        ${this.points.map(e=>e.renderMask())}
                    </mask>
                </defs>
                ${this.points.map(e=>e.render())}
                <polyline class="manual-path-line"
                          points="${this.points.map(e=>`${e.x},${e.y}`).join(" ")}"
                          mask="url(#manual-path-circles-filter)">
                </polyline>
            </g>
        `}toVacuum(e=null){return this.points.map(t=>{const[a,i]=this.realMapToVacuum(t.imageX(),t.imageY());return null===e?[a,i]:[a,i,e]})}addPoint(e,t){this.points.push(new Rr(e,t,this._context))}clear(){this.points=[]}removeLast(){this.points.pop()}static get styles(){return r`
            .manual-path-wrapper {
                --radius: calc(var(--map-card-internal-manual-path-point-radius) / var(--map-scale));
            }

            .manual-path-line {
                fill: transparent;
                stroke: var(--map-card-internal-manual-path-line-color);
                stroke-width: calc(var(--map-card-internal-manual-path-line-width) / var(--map-scale));
            }

            .manual-path-point {
                r: var(--radius);
                stroke: var(--map-card-internal-manual-path-point-line-color);
                fill: var(--map-card-internal-manual-path-point-fill-color);
                stroke-width: calc(var(--map-card-internal-manual-path-point-line-width) / var(--map-scale));
            }
        `}}function $r(e){const t=e.substring(0,e.indexOf("."));return"camera"===t||"image"===t}function Nr(e,t){return{type:"custom:"+yo,map_source:{camera:e},calibration_source:{camera:!0},entity:t,vacuum_platform:cr.TASSHACK_DREAME_VACUUM_PLATFORM}}class Ir extends Er{constructor(e,t){super(t),this._common_config=e,this._selected=e.default_state==Oo.SELECTED,this._common_config.state_entity&&(this._selected="on"==this._context.getState(this._common_config.state_entity))}get variables(){return this._common_config.variables??super.variables}get selected(){return this._selected}deselect(){this._selected=!1}_toggleSelected(){this._common_config.state_entity?(this._selected="on"!=this._context.getState(this._common_config.state_entity),this._context.toggleEntity(this._common_config.state_entity)):this._selected=!this._selected}isDynamic(){return void 0!==this._common_config.state_entity}}class Lr extends Ir{constructor(e,t){super(e,t),this._config=e,this._iconConfig=this._config.icon??{x:this._config.position[0],y:this._config.position[1],name:"mdi:map-marker"}}static getFromEntities(e,t,a){return e.predefinedSelections.map(e=>e).filter(e=>"string"==typeof e.position).map(e=>e.position.split(".attributes.")).flatMap(e=>{const a=t.states[e[0]];if(!a)return[];const i=2===e.length?a.attributes[e[1]]:a.state;if(null==i)return[];let n=i;if("string"==typeof i)try{n=JSON.parse(i)}catch{return[]}return Array.isArray(n)?n.filter(e=>Array.isArray(e)&&e.length>=2&&"number"==typeof e[0]&&"number"==typeof e[1]):[]}).map(e=>new Lr({position:e,label:void 0,icon:{x:e[0],y:e[1],name:"mdi:map-marker"}},a()))}render(){return H`
            <g class="predefined-point-wrapper ${this._selected?"selected":""}">
                ${this.renderIcon(this._iconConfig,()=>this._click(),"predefined-point-icon-wrapper")}
                ${this.renderLabel(this._config.label,"predefined-point-label")}
            </g>
        `}toVacuum(e=null){return"string"==typeof this._config.position?[0,0]:null===e?this._config.position:[...this._config.position,e]}async _click(){if(this._toggleSelected(),be("selection"),this._selected){const e=this._context.selectedPredefinedPoint().pop();void 0!==e&&(e._selected=!1),this._context.selectedPredefinedPoint().push(this)}else Bo(this._context.selectedPredefinedPoint(),this);if(await this._context.runImmediately().catch(()=>!1))return this._selected=!1,void Bo(this._context.selectedPredefinedPoint(),this);this.update()}static get styles(){return r`
            .predefined-point-wrapper {
            }

            .predefined-point-icon-wrapper {
                x: var(--x-icon);
                y: var(--y-icon);
                height: var(--map-card-internal-predefined-point-icon-wrapper-size);
                width: var(--map-card-internal-predefined-point-icon-wrapper-size);
                border-radius: var(--map-card-internal-small-radius);
                transform-box: fill-box;
                overflow: hidden;
                transform: translate(
                        calc(var(--map-card-internal-predefined-point-icon-wrapper-size) / -2),
                        calc(var(--map-card-internal-predefined-point-icon-wrapper-size) / -2)
                    )
                    scale(calc(1 / var(--map-scale)));
                background: var(--map-card-internal-predefined-point-icon-background-color);
                color: var(--map-card-internal-predefined-point-icon-color);
                --mdc-icon-size: var(--map-card-internal-predefined-point-icon-size);
                transition:
                    color var(--map-card-internal-transitions-duration) var(--dvc-ease, ease),
                    background var(--map-card-internal-transitions-duration) var(--dvc-ease, ease);
            }

            .predefined-point-label {
                text-anchor: middle;
                dominant-baseline: middle;
                pointer-events: none;
                font-size: calc(var(--map-card-internal-predefined-point-label-font-size) / var(--map-scale));
                fill: var(--map-card-internal-predefined-point-label-color);
                transition:
                    color var(--map-card-internal-transitions-duration) var(--dvc-ease, ease),
                    background var(--map-card-internal-transitions-duration) var(--dvc-ease, ease);
            }

            .predefined-point-wrapper.selected > * > .predefined-point-icon-wrapper {
                background: var(--map-card-internal-predefined-point-icon-background-color-selected);
                color: var(--map-card-internal-predefined-point-icon-color-selected);
            }

            .predefined-point-wrapper.selected > .predefined-point-label {
                fill: var(--map-card-internal-predefined-point-label-color-selected);
            }
        `}}class Or extends Ir{constructor(e,t){super(e,t),this._config=e}static getFromEntities(e,t,a){return e.predefinedSelections.map(e=>e).filter(e=>"string"==typeof e.zones).map(e=>e.zones.split(".attributes.")).flatMap(e=>{const a=t.states[e[0]];if(!a)return[];const i=2===e.length?a.attributes[e[1]]:a.state;if(null==i)return[];let n=i;if("string"==typeof i)try{n=JSON.parse(i)}catch{return[]}return Array.isArray(n)?n.filter(e=>Array.isArray(e)&&e.length>=4&&e.slice(0,4).every(e=>"number"==typeof e)):[]}).map(e=>new Or({zones:[e],label:void 0,icon:{x:(e[0]+e[2])/2,y:(e[1]+e[3])/2,name:"mdi:broom"}},a()))}render(){let e=[];"string"!=typeof this._config.zones&&(e=this._config.zones);const t=e.map(e=>this.vacuumToMapRect(e)[0]);return H`
            <g class="predefined-rectangle-wrapper ${this._selected?"selected":""}">
                ${t.map(e=>H`
                    <polygon class="predefined-rectangle clickable"
                             points="${e.map(e=>e.join(", ")).join(" ")}"
                             @click="${async()=>this._click()}">
                    </polygon>
                `)}
                ${this.renderIcon(this._config.icon,()=>this._click(),"predefined-rectangle-icon-wrapper")}
                ${this.renderLabel(this._config.label,"predefined-rectangle-label")}
            </g>
        `}size(){return this._config.zones.length}toVacuum(e){return"string"==typeof this._config.zones?[]:null===e?this._config.zones:this._config.zones.map(t=>[...t,e])}async _click(){if(!this._selected&&this._context.selectedPredefinedRectangles().map(e=>e.size()).reduce((e,t)=>e+t,0)+this.size()>this._context.maxSelections())be("failure");else{if(this._toggleSelected(),this._selected?this._context.selectedPredefinedRectangles().push(this):Bo(this._context.selectedPredefinedRectangles(),this),await this._context.runImmediately().catch(()=>!1))return this._selected=!1,void Bo(this._context.selectedPredefinedRectangles(),this);be("selection"),this.update()}}static get styles(){return r`
            .predefined-rectangle-wrapper {
            }

            .predefined-rectangle-wrapper.selected {
            }

            .predefined-rectangle {
                width: var(--width);
                height: var(--height);
                x: var(--x);
                y: var(--y);
                stroke: var(--map-card-internal-predefined-rectangle-line-color);
                stroke-linejoin: round;
                stroke-dasharray:
                    calc(var(--map-card-internal-predefined-rectangle-line-segment-line) / var(--map-scale)),
                    calc(var(--map-card-internal-predefined-rectangle-line-segment-gap) / var(--map-scale));
                fill: var(--map-card-internal-predefined-rectangle-fill-color);
                stroke-width: calc(var(--map-card-internal-predefined-rectangle-line-width) / var(--map-scale));
                transition:
                    stroke var(--map-card-internal-transitions-duration) var(--dvc-ease, ease),
                    fill var(--map-card-internal-transitions-duration) var(--dvc-ease, ease);
                pointer-events: none;
            }

            .predefined-rectangle-wrapper.selected > .predefined-rectangle {
                pointer-events: all;
            }

            .predefined-rectangle-icon-wrapper {
                x: var(--x-icon);
                y: var(--y-icon);
                height: var(--map-card-internal-predefined-rectangle-icon-wrapper-size);
                width: var(--map-card-internal-predefined-rectangle-icon-wrapper-size);
                border-radius: var(--map-card-internal-small-radius);
                transform-box: fill-box;
                transform: translate(
                        calc(var(--map-card-internal-predefined-rectangle-icon-wrapper-size) / -2),
                        calc(var(--map-card-internal-predefined-rectangle-icon-wrapper-size) / -2)
                    )
                    scale(calc(1 / var(--map-scale)));
                background: var(--map-card-internal-predefined-rectangle-icon-background-color);
                color: var(--map-card-internal-predefined-rectangle-icon-color);
                --mdc-icon-size: var(--map-card-internal-predefined-rectangle-icon-size);
                transition:
                    color var(--map-card-internal-transitions-duration) var(--dvc-ease, ease),
                    background var(--map-card-internal-transitions-duration) var(--dvc-ease, ease);
                pointer-events: none;
            }

            .predefined-rectangle-wrapper.selected > * > .predefined-rectangle-icon-wrapper {
                pointer-events: all;
            }

            .predefined-rectangle-label {
                text-anchor: middle;
                dominant-baseline: middle;
                pointer-events: none;
                font-size: calc(var(--map-card-internal-predefined-rectangle-label-font-size) / var(--map-scale));
                fill: var(--map-card-internal-predefined-rectangle-label-color);
                transition:
                    color var(--map-card-internal-transitions-duration) var(--dvc-ease, ease),
                    background var(--map-card-internal-transitions-duration) var(--dvc-ease, ease);
            }

            .predefined-rectangle-wrapper.selected > .predefined-rectangle {
                stroke: var(--map-card-internal-predefined-rectangle-line-color-selected);
                fill: var(--map-card-internal-predefined-rectangle-fill-color-selected);
            }

            .predefined-rectangle-wrapper.selected > * > .predefined-rectangle-icon-wrapper {
                background: var(--map-card-internal-predefined-rectangle-icon-background-color-selected);
                color: var(--map-card-internal-predefined-rectangle-icon-color-selected);
            }

            .predefined-rectangle-wrapper.selected > .predefined-rectangle-label {
                fill: var(--map-card-internal-predefined-rectangle-label-color-selected);
            }
        `}}class Dr extends Ir{constructor(e,t){super(e,t),this._config=e}_renderRoomLabel(){const e=this._config.label;if(!e)return null;const t=this.vacuumToScaledMap(e.x,e.y),a=e.text??"";if(!a)return null;const i=t[0],n=t[1],o=12/this._context.scale(),r=.72*o,s=.34*o,l=Math.max(a.length,1)*o*.58+2*r,c=o+2*s;return H`
            <g class="room-label">
                <rect class="room-label-pill"
                      x="${i-l/2}"
                      y="${n-c/2}"
                      width="${l}"
                      height="${c}"
                      rx="${c/2}"
                      ry="${c/2}"
                      pointer-events="none"></rect>
                <text class="room-label-text"
                      x="${i}"
                      y="${n}"
                      font-size="${o}"
                      text-anchor="middle"
                      dominant-baseline="central"
                      pointer-events="none">
                    ${a}
                </text>
            </g>
        `}render(){return this.renderLabelOnly()}renderLabelOnly(){const e=this._context.selectedRooms().length>0&&!this._selected,t=["room-wrapper",this._selected?"selected":"",e?"dimmed":"",`room-${`${this._config.id}`.replace(/[^a-zA-Z0-9_-]/g,"_")}-wrapper`].filter(Boolean).join(" ");return H`
            <g class="${t}">
                ${this._renderRoomLabel()}
            </g>
        `}toVacuum(){return this._config.id}getOutline(){return this._config.outline}async toggleFromHitTest(){const e=this._context.getCurrentMode();if(e?.selectionType!==fo.ROOM){this._context.activateRoomMode(),await new Promise(e=>setTimeout(e,150));const e=this._context.getCurrentMode();if(e?.selectionType!==fo.ROOM)return}const t=this._context.selectedRooms().includes(this);if(!this._selected&&!t&&this._context.selectedRooms().length>=this._context.maxSelections())be("failure");else{if(this._toggleSelected(),this._selected?t||this._context.selectedRooms().push(this):t&&Bo(this._context.selectedRooms(),this),this._context.selectionChanged(),await this._context.runImmediately().catch(()=>!1))return this._selected=!1,Bo(this._context.selectedRooms(),this),void this._context.selectionChanged();be("selection"),this.update()}}static get styles(){return r`
            /* Pilule-badge sous le nom de pièce (fond sombre translucide premium). */
            .room-label-pill {
                fill: rgba(18, 18, 20, 0.55);
                transition:
                    fill 0.3s ease,
                    opacity 0.3s ease;
            }
            .room-label-text {
                fill: #fff;
                font-weight: 600;
                letter-spacing: 0.02em;
                font-family: inherit;
                pointer-events: none;
                transition:
                    opacity 0.3s ease,
                    fill 0.3s ease;
            }

            /* Mode pièce : badges atténués par défaut */
            .room-mode .room-label-pill,
            .room-mode .room-label-text {
                opacity: 0.55;
            }

            /* Pièce sélectionnée : badge en couleur d'accent, texte net */
            .room-wrapper.selected .room-label-pill {
                fill: var(--map-card-internal-primary-color, var(--primary-color, #0a84ff));
                /* Petit "pop" à la sélection — purement décoratif, centré sur la pilule. */
                transform-box: fill-box;
                transform-origin: center;
                animation: dvc-pill-pop 320ms var(--dvc-ease, cubic-bezier(0.32, 0.72, 0, 1));
            }

            @keyframes dvc-pill-pop {
                0% {
                    transform: scale(0.86);
                }
                55% {
                    transform: scale(1.06);
                }
                100% {
                    transform: scale(1);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .room-wrapper.selected .room-label-pill {
                    animation: none;
                }
            }
            .room-wrapper.selected .room-label-text {
                fill: #fff;
                font-weight: 700;
            }
            .room-mode .room-wrapper.selected .room-label-pill,
            .room-mode .room-wrapper.selected .room-label-text {
                opacity: 1;
            }

            /* Pièces non sélectionnées quand une sélection est active */
            .room-mode .room-wrapper.dimmed .room-label-pill,
            .room-mode .room-wrapper.dimmed .room-label-text {
                opacity: 0.3;
            }
            .room-wrapper.dimmed .room-label-pill,
            .room-wrapper.dimmed .room-label-text {
                opacity: 0.4;
            }
        `}}function Vr(e){return void 0===e.x?["validation.preset.map_modes.predefined_selections.icon.x.missing"]:void 0===e.y?["validation.preset.map_modes.predefined_selections.icon.y.missing"]:e.name?[]:["validation.preset.map_modes.predefined_selections.icon.name.missing"]}function Ur(e){return void 0===e.x?["validation.preset.map_modes.predefined_selections.label.x.missing"]:void 0===e.y?["validation.preset.map_modes.predefined_selections.label.y.missing"]:e.text?[]:["validation.preset.map_modes.predefined_selections.label.text.missing"]}function Kr(e,t){const a=[],i=cr.getPlatformsWithDefaultCalibration(),n=new Map([["entity","validation.preset.entity.missing"],["map_source","validation.preset.map_source.missing"]]),o=cr.getPlatformName(e.vacuum_platform);i.includes(o)||n.set("calibration_source","validation.preset.calibration_source.missing");const r=Object.keys(e);var s,l;return n.forEach((e,t)=>{r.includes(t)||a.push(e)}),e.map_source&&(s=e.map_source,s.camera||s.image?s.camera&&s.image?["validation.preset.map_source.ambiguous"]:[]:["validation.preset.map_source.none_provided"]).forEach(e=>a.push(e)),e.calibration_source&&(l=e.calibration_source,Object.keys(l).filter(e=>"attribute"!=e).length>1?["validation.preset.calibration_source.ambiguous"]:l.calibration_points?[3,4].includes(l.calibration_points.length)?l.calibration_points.flatMap(e=>function(e){const t=[];return e?.map||t.push("validation.preset.calibration_source.calibration_points.missing_map"),e?.vacuum||t.push("validation.preset.calibration_source.calibration_points.missing_vacuum"),[e?.map,e?.vacuum].filter(e=>void 0===e?.x||void 0===e?.y).length>0&&t.push("validation.preset.calibration_source.calibration_points.missing_coordinate"),t}(e)):["validation.preset.calibration_source.calibration_points.invalid_number"]:[]).forEach(e=>a.push(e)),e.vacuum_platform&&!cr.getPlatforms().includes(cr.getPlatformName(e.vacuum_platform))&&a.push(["validation.preset.platform.invalid","{0}",e.vacuum_platform]),(e.map_modes??[]).flatMap(e=>function(e,t,a){if(!t)return["validation.preset.map_modes.invalid"];if(t.template&&!cr.isValidModeTemplate(e,t.template))return[["validation.preset.map_modes.template.invalid","{0}",t.template]];const i=[];t.template||t.icon||i.push("validation.preset.map_modes.icon.missing"),t.template||t.name||i.push("validation.preset.map_modes.name.missing"),t.template||t.service_call_schema||i.push("validation.preset.map_modes.service_call_schema.missing");const n=new dr(e,t,a);switch(n.selectionType){case fo.PREDEFINED_RECTANGLE:n.predefinedSelections.flatMap(e=>function(e){const t=e,a=[];return t.zones||a.push("validation.preset.map_modes.predefined_selections.zones.missing"),Array.isArray(t.zones)&&t.zones.filter(e=>4!=e.length).length>0&&a.push("validation.preset.map_modes.predefined_selections.zones.invalid_parameters_number"),t.icon&&Vr(t.icon).forEach(e=>a.push(e)),t.label&&Ur(t.label).forEach(e=>a.push(e)),a}(e)).forEach(e=>i.push(e));break;case fo.ROOM:n.predefinedSelections.flatMap(e=>function(e){const t=e,a=[];return void 0===t.id||null===t.id?a.push("validation.preset.map_modes.predefined_selections.rooms.id.missing"):t.id.toString().match(/^[A-Za-z0-9 _]+$/i)||a.push(["validation.preset.map_modes.predefined_selections.rooms.id.invalid_format","{0}",t.id.toString()]),(t.outline??[]).filter(e=>2!=e.length).length>0&&a.push("validation.preset.map_modes.predefined_selections.rooms.outline.invalid_parameters_number"),t.icon&&Vr(t.icon).forEach(e=>a.push(e)),t.label&&Ur(t.label).forEach(e=>a.push(e)),a}(e)).forEach(e=>i.push(e));break;case fo.PREDEFINED_POINT:n.predefinedSelections.flatMap(e=>function(e){const t=e,a=[];return t.position||a.push("validation.preset.map_modes.predefined_selections.points.position.missing"),"string"!=typeof t.position&&2!=t.position?.length&&a.push("validation.preset.map_modes.predefined_selections.points.position.invalid_parameters_number"),t.icon&&Vr(t.icon).forEach(e=>a.push(e)),t.label&&Ur(t.label).forEach(e=>a.push(e)),a}(e)).forEach(e=>i.push(e));break;case fo.MANUAL_RECTANGLE:case fo.MANUAL_PATH:case fo.MANUAL_POINT:(n.predefinedSelections?.length??0)>0&&i.push(["validation.preset.map_modes.predefined_selections.not_applicable","{0}",fo[n.selectionType]])}return t.service_call_schema&&function(e){return e.service?e.service.includes(".")?[]:[["validation.preset.map_modes.service_call_schema.service.invalid","{0}",e.service]]:["validation.preset.map_modes.service_call_schema.service.missing"]}(t.service_call_schema).forEach(e=>i.push(e)),i}(o,e,t)).forEach(e=>a.push(e)),a}function Fr(e,t){return Array.isArray(t)?[e.a*t[0]+e.c*t[1]+e.e,e.b*t[0]+e.d*t[1]+e.f]:{x:e.a*t.x+e.c*t.y+e.e,y:e.b*t.x+e.d*t.y+e.f}}function qr(...e){const t=(e,t)=>({a:e.a*t.a+e.c*t.b,c:e.a*t.c+e.c*t.d,e:e.a*t.e+e.c*t.f+e.e,b:e.b*t.a+e.d*t.b,d:e.b*t.c+e.d*t.d,f:e.b*t.e+e.d*t.f+e.f});switch((e=Array.isArray(e[0])?e[0]:e).length){case 0:throw new Error("no matrices provided");case 1:return e[0];case 2:return t(e[0],e[1]);default:{const[a,i,...n]=e;return qr(t(a,i),...n)}}}function Hr(e,t){const a=null!=e[0].x?e[0].x:e[0][0],i=null!=e[0].y?e[0].y:e[0][1],n=null!=t[0].x?t[0].x:t[0][0],o=null!=t[0].y?t[0].y:t[0][1],r=null!=e[1].x?e[1].x:e[1][0],s=null!=e[1].y?e[1].y:e[1][1],l=null!=t[1].x?t[1].x:t[1][0],c=null!=t[1].y?t[1].y:t[1][1],d=null!=e[2].x?e[2].x:e[2][0],u=null!=e[2].y?e[2].y:e[2][1],m=null!=t[2].x?t[2].x:t[2][0],p=null!=t[2].y?t[2].y:t[2][1],g={a:n-m,b:o-p,c:l-m,d:c-p,e:m,f:p},_=function(e){const{a:t,b:a,c:i,d:n,e:o,f:r}=e,s=t*n-a*i;return{a:n/s,b:a/-s,c:i/-s,d:t/s,e:(n*o-i*r)/-s,f:(a*o-t*r)/s}}({a:a-d,b:i-u,c:r-d,d:s-u,e:d,f:u});return function(e,t=1e10){return{a:Math.round(e.a*t)/t,b:Math.round(e.b*t)/t,c:Math.round(e.c*t)/t,d:Math.round(e.d*t)/t,e:Math.round(e.e*t)/t,f:Math.round(e.f*t)/t}}(qr([g,_]))}function Gr(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Br,Zr,Yr={},Xr=function(){if(Br)return Yr;function e(e){var t;return"object"==typeof e?"object"==typeof(t=e[0])?[e.length,t.length]:[e.length]:[]}function t(e,a,i,n){if(i===a.length-1)return n(e);var o,r=a[i],s=Array(r);for(o=r-1;o>=0;o--)s[o]=t(e[o],a,i+1,n);return s}function a(e){var t,a=e.length,i=Array(a);for(t=a-1;-1!==t;--t)i[t]=e[t];return i}function i(i){if("object"!=typeof i)return i;var n=a;return t(i,e(i),0,n)}function n(e,t,a){void 0===a&&(a=0);var i,o=e[a],r=Array(o);if(a===e.length-1){for(i=o-2;i>=0;i-=2)r[i+1]=t,r[i]=t;return-1===i&&(r[0]=t),r}for(i=o-1;i>=0;i--)r[i]=n(e,t,a+1);return r}function o(e){return function(e){var t,a,i,n,o=e.length,r=Array(o);for(t=o-1;t>=0;t--){for(n=Array(o),a=t+2,i=o-1;i>=a;i-=2)n[i]=0,n[i-1]=0;for(i>t&&(n[i]=0),n[t]=e[t],i=t-1;i>=1;i-=2)n[i]=0,n[i-1]=0;0===i&&(n[0]=0),r[t]=n}return r}(n([e],1))}function r(e,t){var a,i,n,o,r,s,l,c,d,u,m;for(o=e.length,r=t.length,s=t[0].length,l=Array(o),a=o-1;a>=0;a--){for(c=Array(s),d=e[a],n=s-1;n>=0;n--){for(u=d[r-1]*t[r-1][n],i=r-2;i>=1;i-=2)m=i-1,u+=d[i]*t[i][n]+d[m]*t[m][n];0===i&&(u+=d[0]*t[0][n]),c[n]=u}l[a]=c}return l}function s(e,t){var a,i,n=e.length,o=e[n-1]*t[n-1];for(a=n-2;a>=1;a-=2)i=a-1,o+=e[a]*t[a]+e[i]*t[i];return 0===a&&(o+=e[0]*t[0]),o}function l(e){var t,a,i,n,o,r=e.length,s=e[0].length,l=Array(s);for(a=0;a<s;a++)l[a]=Array(r);for(t=r-1;t>=1;t-=2){for(n=e[t],i=e[t-1],a=s-1;a>=1;--a)(o=l[a])[t]=n[a],o[t-1]=i[a],(o=l[--a])[t]=n[a],o[t-1]=i[a];0===a&&((o=l[0])[t]=n[0],o[t-1]=i[0])}if(0===t){for(i=e[0],a=s-1;a>=1;--a)l[a][0]=i[a],l[--a][0]=i[a];0===a&&(l[0][0]=i[0])}return l}function c(e){return Math.round(1e10*e)/1e10}return Br=1,Object.defineProperty(Yr,"__esModule",{value:!0}),Yr.default=function(t,a){var n=function(t,a){var n,d=[[t[0],t[1],1,0,0,0,-1*a[0]*t[0],-1*a[0]*t[1]],[0,0,0,t[0],t[1],1,-1*a[1]*t[0],-1*a[1]*t[1]],[t[2],t[3],1,0,0,0,-1*a[2]*t[2],-1*a[2]*t[3]],[0,0,0,t[2],t[3],1,-1*a[3]*t[2],-1*a[3]*t[3]],[t[4],t[5],1,0,0,0,-1*a[4]*t[4],-1*a[4]*t[5]],[0,0,0,t[4],t[5],1,-1*a[5]*t[4],-1*a[5]*t[5]],[t[6],t[7],1,0,0,0,-1*a[6]*t[6],-1*a[6]*t[7]],[0,0,0,t[6],t[7],1,-1*a[7]*t[6],-1*a[7]*t[7]]],u=a;try{n=function(t){var a,n,r,s,l,c,d,u,m=e(t),p=Math.abs,g=m[0],_=m[1],h=i(t),v=o(g);for(c=0;c<_;++c){var f=-1,b=-1;for(l=c;l!==g;++l)(d=p(h[l][c]))>b&&(f=l,b=d);for(n=h[f],h[f]=h[c],h[c]=n,s=v[f],v[f]=v[c],v[c]=s,u=n[c],d=c;d!==_;++d)n[d]/=u;for(d=_-1;-1!==d;--d)s[d]/=u;for(l=g-1;-1!==l;--l)if(l!==c){for(a=h[l],r=v[l],u=a[c],d=c+1;d!==_;++d)a[d]-=n[d]*u;for(d=_-1;d>0;--d)r[d]-=s[d]*u,r[--d]-=s[d]*u;0===d&&(r[0]-=s[0]*u)}}return v}(r(l(d),d))}catch(e){return[1,0,0,0,1,0,0,0]}for(var m=function(e,t){var a,i=e.length,n=Array(i);for(a=i-1;a>=0;a--)n[a]=s(e[a],t);return n}(r(n,l(d)),u),p=0;p<m.length;p++)m[p]=c(m[p]);return m[8]=1,m}(t,a);return function(e,t){return function(e,t,a){var i=[];return i[0]=(e[0]*t+e[1]*a+e[2])/(e[6]*t+e[7]*a+1),i[1]=(e[3]*t+e[4]*a+e[5])/(e[6]*t+e[7]*a+1),i}(n,e,t)}},Yr}(),Wr=Gr(Xr);!function(e){e[e.AFFINE=0]="AFFINE",e[e.PERSPECTIVE=1]="PERSPECTIVE"}(Zr||(Zr={}));class Jr{constructor(e){const t=e?.map(e=>e.map),a=e?.map(e=>e.vacuum);if(t&&a){if(3===t.length)this.transformMode=Zr.AFFINE,this.mapToVacuumMatrix=Hr(t,a),this.vacuumToMapMatrix=Hr(a,t);else{this.transformMode=Zr.PERSPECTIVE;const e=t.flatMap(e=>[e.x,e.y]),i=a.flatMap(e=>[e.x,e.y]);this.mapToVacuumTransformer=Wr(e,i),this.vacuumToMapTransformer=Wr(i,e)}this.calibrated=this.selfCheck(t,a)}else this.calibrated=!0}selfCheck(e,t){const a=e=>{const t=e.map(e=>e.x),a=e.map(e=>e.y);return Math.hypot(Math.max(...t)-Math.min(...t),Math.max(...a)-Math.min(...a))},i=(e,t,a)=>Number.isFinite(e[0])&&Number.isFinite(e[1])&&Math.hypot(e[0]-t.x,e[1]-t.y)<=a,n=Math.max(.5,.005*a(t)),o=Math.max(.5,.005*a(e));try{return e.every((e,a)=>{const r=this.mapToVacuum(e.x,e.y),s=this.vacuumToMap(t[a].x,t[a].y);return i(r,t[a],n)&&i(s,e,o)})}catch{return!1}}mapToVacuum(e,t){if(this.transformMode===Zr.AFFINE&&this.mapToVacuumMatrix)return Fr(this.mapToVacuumMatrix,[e,t]);if(this.transformMode===Zr.PERSPECTIVE&&this.mapToVacuumTransformer)return this.mapToVacuumTransformer(e,t);if(!this.transformMode)return[e,t];throw Error("Missing calibration")}vacuumToMap(e,t){if(this.transformMode===Zr.AFFINE&&this.vacuumToMapMatrix)return Fr(this.vacuumToMapMatrix,[e,t]);if(this.transformMode===Zr.PERSPECTIVE&&this.vacuumToMapTransformer)return this.vacuumToMapTransformer(e,t);if(!this.transformMode)return[e,t];throw Error("Missing calibration")}}const Qr={posKey:void 0,posTs:0,glideMs:400,headingDeg:void 0};class es{constructor(e){this.deps=e}reset(){this.displayedUrl=void 0,this.pendingUrl=void 0,this.lastValidUrl=void 0}resolveSrc({mapSource:e,cameraEntityPicture:t,isFresh:a}){if(e.camera){if(a&&t){const e=this.deps.resolveUrl(t);return this.lastValidUrl=e,this._preload(e),this.displayedUrl??e}return this.displayedUrl?this.displayedUrl:this.lastValidUrl?this.lastValidUrl:xo}return e.image?`${e.image}`:xo}_preload(e){if(e===this.displayedUrl||e===this.pendingUrl)return;this.pendingUrl=e;const t=new Image;t.crossOrigin="anonymous";const a=()=>{this.pendingUrl===e&&(this.pendingUrl=void 0,this.displayedUrl=e,this.deps.onSwapped())};t.onload=a,t.onerror=()=>{this.pendingUrl===e&&(this.pendingUrl=void 0)},t.src=e,t.decode&&t.decode().then(a).catch(()=>{})}}class ts{constructor(e){this.deps=e,this.pickCanvas=null,this.pickCtx=null,this.rawToRoomId=new Map,this.apiRoomPolygonsCache=null}get currentPickCanvas(){return this.pickCanvas}ensurePickCanvas(){const e=this.deps.getCameraState();if(!e)return;const t=e.attributes.segment_map,a=t?`seg:${ts.hashString(t)}`:`poly:${ts.hashRoomsStructure(e.attributes.rooms)}`;a===this.lastPickCacheKey&&this.pickCanvas||a!==this.pickLoadingKey&&(t?this.loadSegmentMap(t,a):this.buildPickCanvasFromPolygons(a))}static hashString(e){let t=5381;for(let a=0;a<e.length;a+=64)t=(t<<5)+t+e.charCodeAt(a)|0;return`${e.length}:${t}`}static hashRoomsStructure(e){if(!e||"object"!=typeof e)return"empty";const t=Object.keys(e).sort(),a=[];for(const i of t){const t=e[i];a.push(`${i}:${t?.visibility??""}:${t?.x0??""},${t?.y0??""},${t?.x1??""},${t?.y1??""}:${t?.outline?.length??0}:${t?.segment_id??""}`)}return a.join("|")}loadSegmentMap(e,t){this.pickLoadingKey=t;const a=new Image;a.onload=()=>{this.pickLoadingKey=void 0;const e=this.deps.getMapImage();if(!e||0===e.naturalWidth)return;const i=a.naturalWidth,n=a.naturalHeight,o=document.createElement("canvas");o.width=i,o.height=n;const r=o.getContext("2d",{willReadFrequently:!0});if(!r)return;r.drawImage(a,0,0);const s=r.getImageData(0,0,i,n).data;let l=!1;for(let e=0;e<s.length;e+=4)if(0!==s[e]||0!==s[e+1]||0!==s[e+2]){l=!0;break}l?(this.pickCanvas=o,this.pickCtx=r,this.lastPickCacheKey=t,this.pickData=void 0,this.pickDataCacheKey=void 0):this.buildPickCanvasFromPolygons(t)},a.onerror=()=>{this.pickLoadingKey=void 0,dr.debug&&console.warn("[PickCanvas] segment_map failed, fallback polygons"),this.buildPickCanvasFromPolygons(t)},a.src=`data:image/png;base64,${e}`}buildPickCanvasFromPolygons(e){const t=this.deps.getMapImage();if(!t||0===t.naturalWidth)return;const a=this.deps.getConverter();if(!a)return;const i=this.getApiRoomPolygons(a);if(0===i.size)return;const n=this.deps.getCameraState(),o=n?.attributes?.rooms,r=t.naturalWidth,s=t.naturalHeight,l=document.createElement("canvas");l.width=r,l.height=s;const c=l.getContext("2d",{willReadFrequently:!0});if(!c)return;c.clearRect(0,0,r,s);const d=[...i.entries()];d.sort((e,t)=>ts.polygonArea(t[1])-ts.polygonArea(e[1]));for(const[e,t]of d){const a=o?.[e]?.segment_id,i="number"==typeof a&&a>0?a:parseInt(e)||0;if(!(0===i||i>255)){c.fillStyle=`rgb(0,0,${i})`,c.beginPath(),c.moveTo(t[0][0],t[0][1]);for(let e=1;e<t.length;e++)c.lineTo(t[e][0],t[e][1]);c.closePath(),c.fill()}}try{const e=document.createElement("canvas");e.width=r,e.height=s;const a=e.getContext("2d");if(a){a.drawImage(t,0,0);const e=a.getImageData(0,0,r,s).data,i=c.getImageData(0,0,r,s),n=i.data;for(let t=0;t<r*s;t++){const a=4*t,i=e[a],o=e[a+1],r=e[a+2];(i+o+r<80||Math.max(i,o,r)-Math.min(i,o,r)<25)&&(n[a]=0,n[a+1]=0,n[a+2]=0,n[a+3]=0)}c.putImageData(i,0,0)}}catch(e){dr.debug&&console.warn("[PickCanvas] Cannot mask (CORS?):",e)}this.pickCanvas=l,this.pickCtx=c,this.lastPickCacheKey=e,this.pickData=void 0,this.pickDataCacheKey=void 0}static polygonArea(e){let t=0;const a=e.length;for(let i=0;i<a;i++){const n=(i+1)%a;t+=e[i][0]*e[n][1],t-=e[n][0]*e[i][1]}return Math.abs(t)/2}getApiRoomPolygons(e){const t=this.deps.getCameraState();if(!t)return new Map;const a=t.attributes.rooms,i=ts.hashRoomsStructure(a);if(this.apiRoomPolygonsCache&&this.apiRoomPolygonsCacheKey===i)return this.apiRoomPolygonsCache;if(!a)return new Map;const n=new Map;for(const t in a){if(!Object.prototype.hasOwnProperty.call(a,t))continue;const i=a[t];if("Hidden"===i.visibility)continue;const o=i.outline?i.outline:null!=i.x0&&null!=i.y0&&null!=i.x1&&null!=i.y1?[[i.x0,i.y0],[i.x1,i.y0],[i.x1,i.y1],[i.x0,i.y1]]:null;if(!o||o.length<3)continue;const r=o.map(t=>e.vacuumToMap(t[0],t[1]));n.set(String(t),r)}return this.apiRoomPolygonsCache=n,this.apiRoomPolygonsCacheKey=i,n}drawSelectionOverlay(e,t,a,i){const n=e.getContext("2d");if(!n)return;if("room"!==i)return void n.clearRect(0,0,e.width,e.height);if(!this.pickCtx||!this.pickCanvas)return void n.clearRect(0,0,e.width,e.height);if(!t||0===t.naturalWidth)return;const o=t.naturalWidth,r=t.naturalHeight;e.width===o&&e.height===r||(e.width=o,e.height=r);const s=this.pickCanvas.width,l=this.pickCanvas.height,c=this.buildRawToRoomId(),d=new Set;for(const e of a)d.add(String(e.toVacuum()));const u=new Set;for(const[e,t]of c)d.has(String(t))&&u.add(e);if(0===u.size)for(const e of a){const t=Number(e.toVacuum());Number.isNaN(t)||u.add(t)}const m=u.size>0;this.pickDataCacheKey===this.lastPickCacheKey&&this.pickData||(this.pickData=this.pickCtx.getImageData(0,0,s,l).data,this.pickDataCacheKey=this.lastPickCacheKey);const p=this.pickData,g=`${t.currentSrc}|${s}x${l}`;if(this.mapAlphaMaskKey!==g||!this.mapAlphaMask){const e=document.createElement("canvas");e.width=s,e.height=l;const a=e.getContext("2d",{willReadFrequently:!0});if(a)try{a.drawImage(t,0,0,s,l),this.mapAlphaMask=a.getImageData(0,0,s,l).data,this.mapAlphaMaskKey=g}catch{this.mapAlphaMask=void 0,this.mapAlphaMaskKey=void 0}}const _=this.mapAlphaMask,h=this.overlaySmallCanvas??=document.createElement("canvas");h.width!==s&&(h.width=s),h.height!==l&&(h.height=l);const v=h.getContext("2d");if(!v)return;const f=v.createImageData(s,l),b=f.data;for(let e=0;e<l;e++)for(let t=0;t<s;t++){const a=4*(e*s+t),i=p[a+2];m&&i>0&&u.has(i)||_&&_[a+3]<24||(b[a+3]=100)}v.putImageData(f,0,0),n.clearRect(0,0,o,r),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality="high",n.drawImage(h,0,0,o,r)}buildRawToRoomId(){const e=this.deps.getCameraState(),t=e?.attributes?.rooms,a=ts.hashRoomsStructure(t);if(a===this.rawToRoomIdCacheKey)return this.rawToRoomId;const i=new Map;if(t)for(const[e,a]of Object.entries(t)){const t=a?.segment_id;if("number"==typeof t&&t>0)i.set(t,e);else{const t=parseInt(e);!Number.isNaN(t)&&t>0&&i.set(t,e)}}return this.rawToRoomId=i,this.rawToRoomIdCacheKey=a,i}rawToLogicalRoomId(e){if(0!==e)return this.buildRawToRoomId().get(e)??e}hitTest(e,t){if(!this.pickCtx||!this.pickCanvas)return;const a=Math.round(e*this.pickCanvas.width),i=Math.round(t*this.pickCanvas.height);if(a<0||i<0||a>=this.pickCanvas.width||i>=this.pickCanvas.height)return;const n=this.pickCtx.getImageData(a,i,1,1).data;return this.rawToLogicalRoomId(n[2])}}const as=r`
    ha-card {
        overflow: hidden;
        display: flow-root;
        /* Stacking context propre : les blends/backdrop-filters internes ne fuient pas. */
        isolation: isolate;
        container-type: inline-size;
        container-name: vacuum-card;
        --map-card-internal-primary-color: var(--map-card-primary-color, var(--slider-color));
        --map-card-internal-primary-text-color: var(--map-card-primary-text-color, var(--primary-text-color));
        --map-card-internal-secondary-color: var(--map-card-secondary-color, var(--slider-secondary-color));
        --map-card-internal-secondary-text-color: var(--map-card-secondary-text-color, var(--text-light-primary-color));
        --map-card-internal-tertiary-color: var(--map-card-tertiary-color, var(--secondary-background-color));
        --map-card-internal-tertiary-text-color: var(--map-card-tertiary-text-color, var(--primary-text-color));
        --map-card-internal-disabled-text-color: var(--map-card-disabled-text-color, var(--disabled-text-color));
        /* Le PNG de la caméra est transparent hors des pièces : aucun fond peint sur
           la zone map — la surface de la carte transparaît telle quelle, y compris sur
           les thèmes à cartes translucides (pas de double couche, pas de banding).
           Reste surchargeable par thème via --map-card-zoomer-background. */
        --map-card-internal-zoomer-background: var(--map-card-zoomer-background, transparent);
        --map-card-internal-ripple-color: var(--map-card-ripple-color, #7a7f87);
        --map-card-internal-big-radius: var(--map-card-big-radius, 25px);
        --map-card-internal-small-radius: var(--map-card-small-radius, 18px);
        --map-card-internal-predefined-point-icon-wrapper-size: var(
            --map-card-predefined-point-icon-wrapper-size,
            36px
        );
        --map-card-internal-predefined-point-icon-size: var(--map-card-predefined-point-icon-size, 24px);
        --map-card-internal-predefined-point-icon-color: var(
            --map-card-predefined-point-icon-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-predefined-point-icon-color-selected: var(
            --map-card-predefined-point-icon-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-predefined-point-icon-background-color: var(
            --map-card-predefined-point-icon-background-color,
            var(--map-card-internal-secondary-color)
        );
        --map-card-internal-predefined-point-icon-background-color-selected: var(
            --map-card-predefined-point-icon-background-color-selected,
            var(--map-card-internal-primary-color)
        );
        --map-card-internal-predefined-point-label-color: var(
            --map-card-predefined-point-label-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-predefined-point-label-color-selected: var(
            --map-card-predefined-point-label-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-predefined-point-label-font-size: var(--map-card-predefined-point-label-font-size, 12px);
        --map-card-internal-manual-point-radius: var(--map-card-manual-point-radius, 5px);
        --map-card-internal-manual-point-line-color: var(--map-card-manual-point-line-color, yellow);
        --map-card-internal-manual-point-fill-color: var(--map-card-manual-point-fill-color, transparent);
        --map-card-internal-manual-point-line-width: var(--map-card-manual-point-line-width, 1px);
        --map-card-internal-manual-path-point-radius: var(--map-card-manual-path-point-radius, 5px);
        --map-card-internal-manual-path-point-line-color: var(--map-card-manual-path-point-line-color, yellow);
        --map-card-internal-manual-path-point-fill-color: var(--map-card-manual-path-point-fill-color, transparent);
        --map-card-internal-manual-path-point-line-width: var(--map-card-manual-path-point-line-width, 1px);
        --map-card-internal-manual-path-line-color: var(--map-card-manual-path-line-color, yellow);
        --map-card-internal-manual-path-line-width: var(--map-card-manual-path-line-width, 1px);
        --map-card-internal-predefined-rectangle-line-width: var(--map-card-predefined-rectangle-line-width, 1px);
        --map-card-internal-predefined-rectangle-line-color: var(--map-card-predefined-rectangle-line-color, white);
        --map-card-internal-predefined-rectangle-fill-color: var(
            --map-card-predefined-rectangle-fill-color,
            transparent
        );
        --map-card-internal-predefined-rectangle-line-color-selected: var(
            --map-card-predefined-rectangle-line-color-selected,
            white
        );
        --map-card-internal-predefined-rectangle-fill-color-selected: var(
            --map-card-predefined-rectangle-fill-color-selected,
            rgba(255, 255, 255, 0.2)
        );
        --map-card-internal-predefined-rectangle-line-segment-line: var(
            --map-card-predefined-rectangle-line-segment-line,
            10px
        );
        --map-card-internal-predefined-rectangle-line-segment-gap: var(
            --map-card-predefined-rectangle-line-segment-gap,
            5px
        );
        --map-card-internal-predefined-rectangle-icon-wrapper-size: var(
            --map-card-predefined-rectangle-icon-wrapper-size,
            36px
        );
        --map-card-internal-predefined-rectangle-icon-size: var(--map-card-predefined-rectangle-icon-size, 24px);
        --map-card-internal-predefined-rectangle-icon-color: var(
            --map-card-predefined-rectangle-icon-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-predefined-rectangle-icon-color-selected: var(
            --map-card-predefined-rectangle-icon-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-predefined-rectangle-icon-background-color: var(
            --map-card-predefined-rectangle-icon-background-color,
            var(--map-card-internal-secondary-color)
        );
        --map-card-internal-predefined-rectangle-icon-background-color-selected: var(
            --map-card-predefined-rectangle-icon-background-color-selected,
            var(--map-card-internal-primary-color)
        );
        --map-card-internal-predefined-rectangle-label-color: var(
            --map-card-predefined-rectangle-label-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-predefined-rectangle-label-color-selected: var(
            --map-card-predefined-rectangle-label-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-predefined-rectangle-label-font-size: var(
            --map-card-predefined-rectangle-label-font-size,
            12px
        );
        --map-card-internal-manual-rectangle-line-width: var(--map-card-manual-rectangle-line-width, 1px);
        --map-card-internal-manual-rectangle-line-color: var(--map-card-manual-rectangle-line-color, white);
        --map-card-internal-manual-rectangle-fill-color: var(
            --map-card-manual-rectangle-fill-color,
            rgba(255, 255, 255, 0.2)
        );
        --map-card-internal-manual-rectangle-line-color-selected: var(
            --map-card-manual-rectangle-line-color-selected,
            white
        );
        --map-card-internal-manual-rectangle-fill-color-selected: var(
            --map-card-manual-rectangle-fill-color-selected,
            transparent
        );
        --map-card-internal-manual-rectangle-line-segment-line: var(
            --map-card-manual-rectangle-line-segment-line,
            10px
        );
        --map-card-internal-manual-rectangle-line-segment-gap: var(--map-card-manual-rectangle-line-segment-gap, 5px);
        --map-card-internal-manual-rectangle-description-color: var(
            --map-card-manual-rectangle-description-color,
            white
        );
        --map-card-internal-manual-rectangle-description-font-size: var(
            --map-card-manual-rectangle-description-font-size,
            12px
        );
        --map-card-internal-manual-rectangle-description-offset-x: var(
            --map-card-manual-rectangle-description-offset-x,
            2px
        );
        --map-card-internal-manual-rectangle-description-offset-y: var(
            --map-card-manual-rectangle-description-offset-y,
            -8px
        );
        --map-card-internal-manual-rectangle-delete-circle-radius: var(
            --map-card-manual-rectangle-delete-circle-radius,
            13px
        );
        --map-card-internal-manual-rectangle-delete-circle-line-color: var(
            --map-card-manual-rectangle-delete-circle-line-color,
            white
        );
        --map-card-internal-manual-rectangle-delete-circle-fill-color: var(
            --map-card-manual-rectangle-delete-circle-fill-color,
            var(--map-card-internal-secondary-color)
        );
        --map-card-internal-manual-rectangle-delete-circle-line-color-selected: var(
            --map-card-manual-rectangle-delete-circle-line-color-selected,
            white
        );
        --map-card-internal-manual-rectangle-delete-circle-fill-color-selected: var(
            --map-card-manual-rectangle-delete-circle-fill-color-selected,
            var(--map-card-internal-primary-color)
        );
        --map-card-internal-manual-rectangle-delete-circle-line-width: var(
            --map-card-manual-rectangle-delete-circle-line-width,
            1px
        );
        --map-card-internal-manual-rectangle-delete-icon-color: var(
            --map-card-manual-rectangle-delete-icon-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-manual-rectangle-delete-icon-color-selected: var(
            --map-card-manual-rectangle-delete-icon-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-manual-rectangle-resize-circle-radius: var(
            --map-card-manual-rectangle-resize-circle-radius,
            13px
        );
        --map-card-internal-manual-rectangle-resize-circle-line-color: var(
            --map-card-manual-rectangle-resize-circle-line-color,
            white
        );
        --map-card-internal-manual-rectangle-resize-circle-fill-color: var(
            --map-card-manual-rectangle-resize-circle-fill-color,
            var(--map-card-internal-secondary-color)
        );
        --map-card-internal-manual-rectangle-resize-circle-line-color-selected: var(
            --map-card-manual-rectangle-resize-circle-line-color-selected,
            white
        );
        --map-card-internal-manual-rectangle-resize-circle-fill-color-selected: var(
            --map-card-manual-rectangle-resize-circle-fill-color-selected,
            var(--map-card-internal-primary-color)
        );
        --map-card-internal-manual-rectangle-resize-circle-line-width: var(
            --map-card-manual-rectangle-resize-circle-line-width,
            1px
        );
        --map-card-internal-manual-rectangle-resize-icon-color: var(
            --map-card-manual-rectangle-resize-icon-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-manual-rectangle-resize-icon-color-selected: var(
            --map-card-manual-rectangle-resize-icon-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-room-label-color: var(--map-card-room-label-color, #333);
        --map-card-internal-room-label-font-size: var(--map-card-room-label-font-size, 12px);
        --map-card-internal-transitions-duration: var(--map-card-transitions-duration, 200ms);

        /* ===== Premium "Apple material" design tokens (purely cosmetic) ===== */
        /* Vibrancy glass: theme-aware translucent surface + saturated blur. */
        --dvc-glass-tint: color-mix(
            in srgb,
            var(--ha-card-background, var(--card-background-color, #fff)) 78%,
            transparent
        );
        --dvc-glass-tint-strong: color-mix(
            in srgb,
            var(--ha-card-background, var(--card-background-color, #fff)) 88%,
            transparent
        );
        /* 14px sample radius reads identically to 20px on these small surfaces but
           costs roughly half the GPU time (backdrop sampling scales with radius²). */
        --dvc-glass-blur: saturate(180%) blur(14px);
        /* Hairline separators (Apple 0.5px translucent borders). */
        --dvc-hairline: color-mix(in oklab, var(--primary-text-color, #000) 9%, transparent);
        --dvc-hairline-strong: color-mix(in oklab, var(--primary-text-color, #000) 14%, transparent);
        /* Soft, layered elevation. */
        --dvc-shadow-1:
            0 1px 2px rgba(0, 0, 0, 0.05), 0 6px 16px rgba(0, 0, 0, 0.1), inset 0 0.5px 0 rgba(255, 255, 255, 0.28);
        --dvc-shadow-2:
            0 2px 8px rgba(0, 0, 0, 0.1), 0 16px 40px rgba(0, 0, 0, 0.18), inset 0 0.5px 0 rgba(255, 255, 255, 0.32);
        /* Apple-like motion. */
        --dvc-ease: cubic-bezier(0.32, 0.72, 0, 1);
        --dvc-ease-out: cubic-bezier(0.4, 0, 0.2, 1);
        --dvc-dur-tap: 180ms;
        --dvc-radius-pill: 980px;

        /* Refined system typography (SF on Apple devices, Roboto elsewhere) + smoothing. */
        font-family:
            -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Roboto,
            var(--paper-font-body1_-_font-family, sans-serif);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        letter-spacing: -0.01em;
    }

    /* Apparence "minimal" (config appearance: minimal) : surfaces opaques, pas de
       blur, animations ambiantes en pause. Les tokens héritent dans les shadow roots
       des sous-composants. */
    ha-card[data-appearance="minimal"] {
        --dvc-glass-blur: blur(0px);
        --dvc-glass-tint: var(--secondary-background-color);
        --dvc-glass-tint-strong: var(--card-background-color);
        --dvc-anim-state: paused;
    }

    /* Accessibility: collapse decorative motion when the user opted out (this scope only;
       each sub-component guards its own animations the same way). */
    @media (prefers-reduced-motion: reduce) {
        ha-card *,
        ha-card *::before,
        ha-card *::after {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
        }
    }

    /* Responsive: small cards (< 350px) */
    @container vacuum-card (max-width: 349px) {
        ha-card {
            --dvc-header-row-height: 40px;
            --dvc-header-section-padding: 4px 12px;
            --dvc-header-gap: 8px;
            --dvc-header-name-size: 14px;
            --dvc-header-status-size: 13px;
            --dvc-stat-gap: 5px;
            --dvc-stat-font-size: 11.5px;
            --dvc-stat-icon-size: 14px;
            --dvc-action-host-padding: 6px 10px 12px;
            --dvc-action-gap: 8px;
            --dvc-action-btn-padding: 10px;
            --dvc-action-font-size: 13px;
            --dvc-action-icon-gap: 6px;
            --dvc-action-icon-size: 18px;
            --dvc-tab-padding: 8px 0;
            --dvc-tab-font-size: 12px;
            --dvc-tab-gap: 2px;
            --dvc-tab-icon-size: 18px;
            --dvc-chip-host-padding: 2px 10px;
            --dvc-chip-gap: 6px;
            --dvc-chip-padding: 8px 12px;
            --dvc-chip-font-size: 12px;
            --dvc-progress-host-padding: 0 10px 2px;
            --dvc-progress-font-size: 11px;
        }
        .map-wrapper {
            padding-top: 40px;
        }
        .map-wrapper.with-title {
            padding-top: 52px;
        }
        .controls-wrapper {
            margin: 10px;
            gap: 8px;
        }
        .map-actions-item {
            width: 42px;
            height: 42px;
        }
        .icon-on-map {
            width: 30px;
            height: 30px;
        }
        .standalone-icon-on-map {
            width: 30px;
            height: 30px;
        }
        .cycle-counter {
            font-size: 12px;
        }
        .updating-badge {
            font-size: 11px;
            padding: 4px 8px;
        }
    }

    /* Responsive: large cards (> 500px) */
    @container vacuum-card (min-width: 501px) {
        ha-card {
            --dvc-header-row-height: 50px;
            --dvc-header-section-padding: 8px 20px;
            --dvc-header-name-size: 17px;
            --dvc-header-status-size: 16px;
            --dvc-stat-gap: 9px;
            --dvc-stat-font-size: 14px;
            --dvc-action-host-padding: 10px 20px 20px;
            --dvc-action-gap: 14px;
            --dvc-action-btn-padding: 16px;
        }
        .map-wrapper {
            padding-top: 50px;
        }
        .map-wrapper.with-title {
            padding-top: 64px;
        }
        .controls-wrapper {
            margin: 20px;
            gap: 14px;
        }
        .map-actions-item {
            width: 56px;
            height: 56px;
        }
        .icon-on-map {
            width: 40px;
            height: 40px;
        }
        .standalone-icon-on-map {
            width: 40px;
            height: 40px;
        }
    }

    .clickable {
        cursor: pointer;
    }

    .map-wrapper {
        position: relative;
        height: max-content;
        padding-top: 44px;
    }

    /* Le nom d'appareil ajoute une seconde ligne au header compact. */
    .map-wrapper.with-title {
        padding-top: 58px;
    }

    .map-container {
        position: relative;
    }

    /* Skeleton du premier chargement de la map : shimmer discret sur une zone
       réservée (évite le layout-shift), retiré définitivement au premier @load. */
    .map-container.map-loading {
        min-height: 240px;
    }

    #map-skeleton {
        position: absolute;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        background: linear-gradient(
            100deg,
            color-mix(in oklab, var(--primary-text-color, #000) 5%, transparent) 30%,
            color-mix(in oklab, var(--primary-text-color, #000) 10%, transparent) 50%,
            color-mix(in oklab, var(--primary-text-color, #000) 5%, transparent) 70%
        );
        background-size: 200% 100%;
        animation: dvc-skeleton-shimmer 1.4s linear infinite;
        animation-play-state: var(--dvc-anim-state, running);
    }

    @keyframes dvc-skeleton-shimmer {
        to {
            background-position: -200% 0;
        }
    }

    #map-zoomer {
        overflow: hidden;
        display: block;
        --scale: 1;
        --x: 0;
        --y: 0;
        background: var(--map-card-internal-zoomer-background);
    }

    #map-zoomer-content {
        transform: translate(var(--x), var(--y)) scale(var(--scale));
        transform-origin: 0 0;
        position: relative;
    }

    #map-image {
        width: 100%;
        margin-bottom: -6px;
        pointer-events: none;
    }

    #room-selection-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
        transition: opacity 280ms var(--dvc-ease);
    }

    #map-image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
    }

    .standalone-icon-on-map {
        background: var(--dvc-glass-tint);
        -webkit-backdrop-filter: var(--dvc-glass-blur);
        backdrop-filter: var(--dvc-glass-blur);
        border: 0.5px solid var(--dvc-hairline);
        box-shadow: var(--dvc-shadow-1);
        color: var(--primary-text-color);
        border-radius: var(--map-card-internal-small-radius);
        margin: 5px;
        width: 36px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition:
            transform var(--dvc-dur-tap) var(--dvc-ease-out),
            box-shadow var(--dvc-dur-tap) var(--dvc-ease-out);
    }

    .map-zoom-icons {
        right: 0;
        bottom: 0;
        position: absolute;
        display: flex;
        flex-direction: column-reverse;
        background: var(--dvc-glass-tint);
        -webkit-backdrop-filter: var(--dvc-glass-blur);
        backdrop-filter: var(--dvc-glass-blur);
        border: 0.5px solid var(--dvc-hairline);
        box-shadow: var(--dvc-shadow-1);
        color: var(--primary-text-color);
        border-radius: var(--map-card-internal-small-radius);
        margin: 5px;
        direction: ltr;
    }

    .map-return-base-button {
        left: 0;
        bottom: 0;
        position: absolute;
        display: inline-flex;
        background: var(--dvc-glass-tint);
        -webkit-backdrop-filter: var(--dvc-glass-blur);
        backdrop-filter: var(--dvc-glass-blur);
        border: 0.5px solid var(--dvc-hairline);
        box-shadow: var(--dvc-shadow-1);
        color: var(--primary-text-color);
        border-radius: var(--map-card-internal-small-radius);
        margin: 5px;
        direction: ltr;
    }

    .updating-badge {
        top: 0;
        right: 0;
        position: absolute;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: color-mix(in oklab, rgb(var(--rgb-warning-color, 255, 152, 0)) 82%, transparent);
        -webkit-backdrop-filter: var(--dvc-glass-blur);
        backdrop-filter: var(--dvc-glass-blur);
        border: 0.5px solid rgba(255, 255, 255, 0.18);
        color: var(--text-primary-color, #ffffff);
        border-radius: var(--dvc-radius-pill);
        padding: 6px 12px;
        margin: 5px;
        font-size: 12px;
        font-weight: 590;
        letter-spacing: -0.01em;
        box-shadow: var(--dvc-shadow-1);
        animation: pulse-opacity 2s ease-in-out infinite;
    }

    .updating-icon {
        height: 18px;
        width: 18px;
        animation: spin 2s linear infinite;
    }

    @keyframes pulse-opacity {
        0%,
        100% {
            opacity: 0.9;
        }
        50% {
            opacity: 0.7;
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .map-zoom-icons-main {
        display: inline-flex;
        border-radius: var(--map-card-internal-small-radius);
        background-color: var(--map-card-internal-primary-color);
        color: var(--map-card-internal-primary-text-color);
    }

    .icon-on-map {
        touch-action: auto;
        pointer-events: auto;
        height: 36px;
        width: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: transform var(--dvc-dur-tap) var(--dvc-ease-out);
    }

    .icon-on-map:active {
        transform: scale(0.88);
    }

    .icon-on-map:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
        border-radius: 50%;
    }

    .cycle-counter {
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        user-select: none;
    }

    .icon-on-map.lock-active {
        color: var(--primary-color, #03a9f4);
    }

    .icon-on-map.zone-action {
        background-color: var(--map-card-internal-primary-color);
        color: var(--map-card-internal-primary-text-color);
        border-radius: var(--map-card-internal-small-radius);
    }

    /* Les contrôles en verre flottent au-dessus de la carte pan/zoomée : on leur donne
       leur propre layer de composition pour que le backdrop-filter ne force pas un
       repaint de tout l'overlay à chaque frame de transformation de la carte. */
    .map-zoom-icons,
    .map-return-base-button,
    .map-actions-list,
    .standalone-icon-on-map,
    .updating-badge {
        transform: translateZ(0);
    }

    /* Lévitation douce au survol des contrôles en verre (desktop uniquement). */
    @media (hover: hover) {
        .map-zoom-icons:hover,
        .map-return-base-button:hover,
        .standalone-icon-on-map:hover,
        .map-actions-list:hover {
            box-shadow: var(--dvc-shadow-2);
        }
    }

    .controls-wrapper {
        margin: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .map-controls {
        width: 100%;
        display: inline-flex;
        gap: 10px;
        place-content: space-between;
        flex-wrap: wrap;
    }

    .map-actions-list {
        border-radius: var(--map-card-internal-big-radius);
        overflow: hidden;
        background: var(--dvc-glass-tint);
        -webkit-backdrop-filter: var(--dvc-glass-blur);
        backdrop-filter: var(--dvc-glass-blur);
        border: 0.5px solid var(--dvc-hairline);
        box-shadow: var(--dvc-shadow-1);
        color: var(--primary-text-color);
        margin-inline-start: auto;
        display: inline-flex;
        height: min-content;
    }

    .map-actions-item.main {
        border-radius: var(--map-card-internal-big-radius);
        background-color: var(--map-card-internal-primary-color);
        color: var(--map-card-internal-primary-text-color);
    }

    .map-actions-item {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        transition: transform var(--dvc-dur-tap) var(--dvc-ease-out);
    }

    .map-actions-item:active {
        transform: scale(0.9);
    }

    .ripple {
        position: relative;
        overflow: hidden;
        transform: translate3d(0, 0, 0);
    }

    .ripple:after {
        content: "";
        display: block;
        position: absolute;
        border-radius: 50%;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        background-image: radial-gradient(circle, var(--map-card-internal-ripple-color) 2%, transparent 10.01%);
        background-repeat: no-repeat;
        background-position: 50%;
        transform: scale(10, 10);
        opacity: 0;
        transition:
            transform 0.5s,
            opacity 1s;
    }

    .ripple:active:after {
        transform: scale(0, 0);
        opacity: 0.7;
        transition: 0s;
    }

    ${Er.styles}
    ${Pr.styles}
            ${Or.styles}
            ${jr.styles}
            ${Tr.styles}
            ${Lr.styles}
            ${Dr.styles}
`,is={ms:1,s:1e3,min:6e4,h:36e5,d:864e5},ns=(e,t=2)=>{let a=""+e;for(let e=1;e<t;e++)a=parseInt(a)<10**e?`0${a}`:a;return a},os=(e,t)=>rs(t).format(e),rs=e=>new Intl.DateTimeFormat(e.language,{year:"numeric",month:"long",day:"numeric"}),ss=e=>{if(e.time_format===ve.language||e.time_format===ve.system){const t=e.time_format===ve.language?e.language:void 0,a=(new Date).toLocaleString(t);return a.includes("AM")||a.includes("PM")}return e.time_format===ve.am_pm},ls=(e,t)=>cs(t).format(e),cs=e=>new Intl.DateTimeFormat("en"!==e.language||ss(e)?e.language:"en-u-hc-h23",{year:"numeric",month:"long",day:"numeric",hour:ss(e)?"numeric":"2-digit",minute:"2-digit",hour12:ss(e)}),ds=(e,t)=>us(t).format(e),us=e=>new Intl.DateTimeFormat("en"!==e.language||ss(e)?e.language:"en-u-hc-h23",{hour:"numeric",minute:"2-digit",hour12:ss(e)});var ms,ps,gs;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(ms||(ms={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(ps||(ps={})),function(e){e.language="language",e.monday="monday",e.tuesday="tuesday",e.wednesday="wednesday",e.thursday="thursday",e.friday="friday",e.saturday="saturday",e.sunday="sunday"}(gs||(gs={}));const _s=(e,t,a)=>{const i=t?(e=>{switch(e.number_format){case ms.comma_decimal:return["en-US","en"];case ms.decimal_comma:return["de","es","it"];case ms.space_comma:return["fr","sv","cs"];case ms.system:return;default:return e.language}})(t):void 0;if(t?.number_format!==ms.none&&!Number.isNaN(Number(e))&&Intl)try{return new Intl.NumberFormat(i,vs(e,a)).format(Number(e))}catch(t){return console.error(t),new Intl.NumberFormat(void 0,vs(e,a)).format(Number(e))}return!Number.isNaN(Number(e))&&""!==e&&t?.number_format===ms.none&&Intl?new Intl.NumberFormat("en-US",vs(e,{...a,useGrouping:!1})).format(Number(e)):"string"==typeof e?e:`${((e,t=2)=>Math.round(e*10**t)/10**t)(e,a?.maximumFractionDigits).toString()}${"currency"===a?.style?` ${a.currency}`:""}`},hs=(e,t)=>{const a=t?.display_precision;return null!=a?{maximumFractionDigits:a,minimumFractionDigits:a}:Number.isInteger(Number(e.attributes?.step))&&Number.isInteger(Number(e.state))?{maximumFractionDigits:0}:void 0},vs=(e,t)=>{const a={maximumFractionDigits:2,...t};if("string"!=typeof e)return a;if(!t||void 0===t.minimumFractionDigits&&void 0===t.maximumFractionDigits){const t=e.indexOf(".")>-1?e.split(".")[1].length:0;a.minimumFractionDigits=t,a.maximumFractionDigits=t}return a},fs=(e,t,a,i,n)=>{const o=i?.[t.entity_id];return bs(e,a,o,t.entity_id,t.attributes,void 0!==n?n:t.state)},bs=(e,t,a,i,n,o)=>{if("unknown"===o||"unavailable"===o)return e(`state.default.${o}`);if((e=>!!e.unit_of_measurement||!!e.state_class)(n)){if("duration"===n.device_class&&n.unit_of_measurement&&is[n.unit_of_measurement])try{return r=o,s=n.unit_of_measurement,function(e){const t=Math.floor(e/1e3/3600),a=Math.floor(e/1e3%3600/60),i=Math.floor(e/1e3%3600%60),n=Math.floor(e%1e3);return t>0?`${t}:${ns(a)}:${ns(i)}`:a>0?`${a}:${ns(i)}`:i>0||n>0?`${i}${n>0?`.${ns(n,3)}`:""}`:null}(parseFloat(r)*is[s])||"0"}catch(e){}if("monetary"===n.device_class)try{return _s(o,t,{style:"currency",currency:n.unit_of_measurement,minimumFractionDigits:2,...hs({state:o,attributes:n},a)})}catch(e){}const e=n.unit_of_measurement?"%"===n.unit_of_measurement?(e=>{switch(e.language){case"cs":case"de":case"fi":case"fr":case"sk":case"sv":return" ";default:return""}})(t)+"%":` ${n.unit_of_measurement}`:"";return`${_s(o,t,hs({state:o,attributes:n},a))}${e}`}var r,s;const l=(e=>{const t=e.indexOf(".");return-1===t?"":e.substring(0,t)})(i);if(["date","input_datetime","time"].includes(l)){if(void 0===o){let e;return n.has_date&&n.has_time?(e=new Date(n.year,n.month-1,n.day,n.hour,n.minute),ls(e,t)):n.has_date?(e=new Date(n.year,n.month-1,n.day),os(e,t)):n.has_time?(e=new Date,e.setHours(n.hour,n.minute),ds(e,t)):o}try{const e=o.split(" ");if(2===e.length)return ls(new Date(e.join("T")),t);if(1===e.length){if(o.includes("-"))return os(new Date(`${o}T00:00`),t);if(o.includes(":")){const e=new Date;return ds(new Date(`${e.toISOString().split("T")[0]}T${o}`),t)}}return o}catch(e){return o}}if("humidifier"===l&&"on"===o&&n.humidity)return`${n.humidity} %`;if("counter"===l||"number"===l||"input_number"===l)return _s(o,t,hs({state:o,attributes:n},a));if(["button","input_button","scene","stt","tts"].includes(l)||"sensor"===l&&"timestamp"===n.device_class)try{return ls(new Date(o),t)}catch(e){return o}return a?.translation_key&&e(`component.${a.platform}.entity.${l}.${a.translation_key}.state.${o}`)||n.device_class&&e(`component.${l}.entity_component.${n.device_class}.state.${o}`)||e(`component.${l}.entity_component._.state.${o}`)||o};let ys=class extends ce{constructor(){super(...arguments),this.showTitle=!1,this._siblingCache=new Map,this._siblingCacheEntityId=void 0}_resolveSibling(e,t){const a=`${e}|${t}`;if(this._siblingCacheEntityId===this.entityId&&this._siblingCache.has(a))return this._siblingCache.get(a);this._siblingCacheEntityId!==this.entityId&&(this._siblingCache.clear(),this._siblingCacheEntityId=this.entityId);const i=this.hass.entities?.[this.entityId]?.device_id;if(!i)return void this._siblingCache.set(a,void 0);let n;for(const[a,o]of Object.entries(this.hass.entities))if(o.device_id===i&&a.startsWith("sensor.")&&(o.translation_key===e||a.endsWith(t))){n=a;break}return this._siblingCache.set(a,n),n}shouldUpdate(e){return 0===this._siblingCache.size||Xo(e,this.hass,[this.entityId,...Array.from(this._siblingCache.values())])}render(){if(!this.hass||!this.entityId)return B;const e=this.hass.states[this.entityId];if(!e)return B;const t=e.attributes.friendly_name??this.entityId,a=this.hass.locale?.language,i=(e,t)=>{const a=this._resolveSibling(e,t);if(a){const e=this.hass.states[a];if(e){const t=Number(e.state);if(!isNaN(t))return t}}},n=this._resolveSibling("state","_state");let o,r;if(n&&this.hass.states[n]){const e=this.hass.states[n];r=e.state,o=fs(this.hass.localize,e,this.hass.locale,this.hass.entities)}else r=e.state,o=e.state;"charging_completed"!==r&&"charging_complete"!==r||(o=ho("dreame_ui.status.ready",a));const s=e.attributes.cleaned_area??i("cleaned_area","_cleaned_area"),l=e.attributes.cleaning_time??i("cleaning_time","_cleaning_time"),c=e.attributes.battery_level??i("battery_level","_battery_level");let d=e.attributes.battery_icon??"mdi:battery";if(void 0===e.attributes.battery_level){const e=this._resolveSibling("battery_level","_battery_level");e&&(d=this.hass.states[e]?.attributes?.icon??"mdi:battery")}const u=To.includes(e.state);return q`
            <div class="header-row ${this.showTitle?"with-title":""}" part="header">
                <div class="status-cluster">
                    ${this.showTitle?q`<div class="device-name">${t}</div>`:B}
                    <div class="status" aria-live="polite">
                        ${u?q`<span class="live-dot" aria-hidden="true"></span>`:B}${o}
                    </div>
                </div>
                <div class="stats" part="stats">
                    ${void 0!==s?q`
                                  <div class="stat">
                                      <span class="stat-value">${s}</span>
                                      <span class="stat-unit">${ho("unit.meter_squared_shortcut",a)}</span>
                                  </div>
                              `:B}
                    ${void 0!==l?q`
                                  <div class="stat">
                                      <span class="stat-value">${l}</span>
                                      <span class="stat-unit">${ho("unit.minute_shortcut",a)}</span>
                                  </div>
                              `:B}
                    ${void 0!==c?q`
                                  <div class="stat">
                                      <ha-icon icon="${d}"></ha-icon>
                                      <span class="stat-value">${c}</span>
                                      <span class="stat-unit">%</span>
                                  </div>
                              `:B}
                </div>
            </div>
        `}static get styles(){return r`
            :host {
                display: block;
                text-align: left;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 5;
                pointer-events: none;
            }

            /* Ligne unique : statut à gauche, stats à droite — hauteur ~44px
               (~56px avec le nom d'appareil). Aucun fond peint : la map est clippée
               sous l'en-tête (padding du wrapper), le texte pose donc directement
               sur la surface de la carte — thème-proof, y compris sur les thèmes
               à cartes translucides (--ha-card-background en rgba). */
            .header-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--dvc-header-gap, 12px);
                min-height: var(--dvc-header-row-height, 44px);
                padding: var(--dvc-header-section-padding, 6px 16px);
                box-sizing: border-box;
            }

            .status-cluster {
                min-width: 0;
            }

            .device-name {
                font-size: var(--dvc-header-name-size, 15px);
                font-weight: 600;
                letter-spacing: -0.02em;
                color: var(--primary-text-color);
                text-wrap: pretty;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .status {
                font-size: var(--dvc-header-status-size, 15px);
                font-weight: 600;
                letter-spacing: -0.01em;
                color: var(--primary-text-color);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /* Avec le nom affiché, le statut redevient une ligne secondaire. */
            .with-title .status {
                font-size: 12.5px;
                font-weight: 510;
                color: var(--secondary-text-color);
                margin-top: 1px;
            }

            /* Pastille "live" : le robot travaille (pulsation douce, type indicateur d'appel). */
            .live-dot {
                display: inline-block;
                width: 7px;
                height: 7px;
                margin-right: 6px;
                vertical-align: 1px;
                border-radius: 50%;
                background: var(--success-color, #34c759);
                box-shadow: 0 0 6px color-mix(in oklab, var(--success-color, #34c759) 60%, transparent);
                animation: dvc-live-pulse 2s ease-in-out infinite;
                animation-play-state: var(--dvc-anim-state, running);
            }

            @keyframes dvc-live-pulse {
                0%,
                100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.45;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .live-dot {
                    animation: none;
                }
            }

            .stats {
                display: flex;
                align-items: center;
                flex-shrink: 0;
            }

            .stat {
                display: flex;
                align-items: center;
                gap: 3px;
                font-size: var(--dvc-stat-font-size, 13px);
                color: var(--secondary-text-color);
            }

            /* Séparateur médian entre les stats (à la « 12 m² · 25 min · 100 % »). */
            .stat + .stat::before {
                content: "·";
                margin: 0 var(--dvc-stat-gap, 7px);
                color: var(--secondary-text-color);
                opacity: 0.5;
            }

            .stat ha-icon {
                --mdc-icon-size: var(--dvc-stat-icon-size, 16px);
                opacity: 0.8;
                margin-right: 1px;
            }

            .stat-value {
                font-weight: 590;
                letter-spacing: -0.01em;
                font-variant-numeric: tabular-nums;
                color: var(--primary-text-color);
            }

            /* Pleine opacité : à 0.8, le contraste passait sous 4.5:1 (WCAG AA)
               sur le thème clair par défaut (violation axe color-contrast). */
            .stat-unit {
                color: var(--secondary-text-color);
            }
        `}};e([ge({attribute:!1})],ys.prototype,"hass",void 0),e([ge({attribute:!1})],ys.prototype,"entityId",void 0),e([ge({type:Boolean})],ys.prototype,"showTitle",void 0),ys=e([ue("dreame-status-header")],ys);let ks=class extends ce{constructor(){super(...arguments),this._menuOpen=!1,this._cachedModeEntityId=void 0,this._cachedModeEntityKey=void 0,this._cachedCgEntityId=void 0,this._cachedCgEntityKey=void 0}_getCleaningModeEntity(){if(!this.hass||!this.entityId)return;if(void 0!==this._cachedModeEntityId&&this._cachedModeEntityKey===this.entityId)return this._cachedModeEntityId??void 0;this._cachedModeEntityKey=this.entityId;const e=this.hass.entities[this.entityId]?.device_id;if(!e)return void(this._cachedModeEntityId=null);const t=Object.keys(this.hass.states).find(t=>{const a=this.hass.entities[t];return a?.device_id===e&&t.startsWith("select.")&&t.includes("cleaning_mode")});return this._cachedModeEntityId=t??null,t}_getCleanGeniusEntity(){if(!this.hass||!this.entityId)return;if(void 0!==this._cachedCgEntityId&&this._cachedCgEntityKey===this.entityId)return this._cachedCgEntityId??void 0;this._cachedCgEntityKey=this.entityId;const e=this.hass.entities[this.entityId]?.device_id;if(!e)return void(this._cachedCgEntityId=null);const t=Object.keys(this.hass.states).find(t=>{const a=this.hass.entities[t];return a?.device_id===e&&t.startsWith("select.")&&t.includes("cleangenius")&&!t.includes("cleangenius_mode")});return this._cachedCgEntityId=t??null,t}_getModeIcons(e){const t=e.toLowerCase();return t.includes("sweep")&&t.includes("mop")?["mdi:robot-vacuum","mdi:water-outline"]:t.includes("sweep")?["mdi:robot-vacuum"]:t.includes("mop")?["mdi:water-outline"]:["mdi:robot-vacuum"]}_isCgActive(){const e=this._getCleanGeniusEntity(),t=e?this.hass.states[e]?.state:void 0;return!!t&&!["off","unavailable","unknown",""].includes(t)}_buildChoices(e){const t=[],a=this._getCleanGeniusEntity(),i=a?this.hass.states[a]:void 0;if(i&&Array.isArray(i.attributes.options))for(const a of i.attributes.options)"off"!==a&&t.push({kind:"cleangenius",option:a,label:fs(this.hass.localize,i,this.hass.locale,this.hass.entities,a),icons:["mdi:auto-fix"],selected:e&&i.state===a});const n=this._getCleaningModeEntity(),o=n?this.hass.states[n]:void 0;if(o&&Array.isArray(o.attributes.options))for(const a of o.attributes.options)t.push({kind:"manual",option:a,label:fs(this.hass.localize,o,this.hass.locale,this.hass.entities,a),icons:this._getModeIcons(a),selected:!e&&o.state===a});return t}_handleKeydown(e){"Enter"===e.key||" "===e.key?(e.preventDefault(),this._toggleMenu()):"Escape"===e.key&&this._menuOpen&&(e.preventDefault(),this._menuOpen=!1)}_toggleMenu(){const e=this._isCgActive(),t=this._getCleaningModeEntity(),a=t?this.hass.states[t]?.state:void 0;(!a||"unavailable"===a||"unknown"===a)&&!e||0!==this._buildChoices(e).length&&(this._menuOpen=!this._menuOpen)}async _selectChoice(e){if(this._menuOpen=!1,e.selected||!this.hass)return;if("cleangenius"===e.kind){const t=this._getCleanGeniusEntity();if(!t)return;return void this.hass.callService("select","select_option",{option:e.option},{entity_id:t}).then(()=>be("success"),()=>be("failure"))}const t=this._getCleaningModeEntity();if(!t)return;const a=this._getCleanGeniusEntity();try{if(a&&this._isCgActive()){await this.hass.callService("select","select_option",{option:"off"},{entity_id:a});for(let e=0;e<8;e++){const e=this.hass.states[t]?.state;if(e&&"unavailable"!==e&&"unknown"!==e)break;await new Promise(e=>setTimeout(e,400))}}await this.hass.callService("select","select_option",{option:e.option},{entity_id:t}),be("success")}catch{return void be("failure")}}shouldUpdate(e){return Xo(e,this.hass,[this.entityId,this._cachedModeEntityId,this._cachedCgEntityId])}render(){if(!this.hass||!this.entityId)return B;const e=this._getCleaningModeEntity();if(!e)return B;const t=this.hass.states[e];if(!t)return B;const a=t.state,i=this.hass.locale?.language,n="unavailable"===a||"unknown"===a||!a,o=fs(this.hass.localize,t,this.hass.locale,this.hass.entities),r=ho("tile.cleaning_mode.label",i),s=this._isCgActive(),l=this._getCleanGeniusEntity(),c=l?this.hass.states[l]:void 0,d=s&&c?fs(this.hass.localize,c,this.hass.locale,this.hass.entities):"",u=s?["mdi:auto-fix"]:this._getModeIcons(a),m=s?`CleanGenius · ${d}`:n?"—":o,p=`${r}: ${s?"CleanGenius":n?"—":o}`,g=n&&!s,_=!g,h=_?this._buildChoices(s):[],v=h.filter(e=>"cleangenius"===e.kind),f=h.filter(e=>"manual"===e.kind);return q`
            ${this._menuOpen?q`<div class="menu-backdrop" @click="${()=>this._menuOpen=!1}"></div>`:B}
            <div
                class="mode-chip ${g?"unavailable":""}"
                part="mode-chip"
                role="button"
                tabindex="${_?0:-1}"
                aria-label="${p}"
                aria-haspopup="listbox"
                aria-expanded="${this._menuOpen?"true":"false"}"
                @click="${this._toggleMenu}"
                @keydown="${this._handleKeydown}"
            >
                <div class="mode-icons">
                    ${u.map(e=>q`<ha-icon class="mode-icon" icon="${e}"></ha-icon>`)}
                </div>
                <span class="mode-label">${m}</span>
                <ha-icon class="mode-arrow ${this._menuOpen?"open":""}" icon="mdi:chevron-down"></ha-icon>
            </div>
            ${this._menuOpen?q`
                          <div class="mode-menu" role="listbox" aria-label="${r}">
                              ${v.length>0?q`<div class="menu-section">CleanGenius</div>
                                            ${v.map(e=>this._renderChoice(e))}`:B}
                              ${f.length>0?q`<div class="menu-section">
                                                ${ho("dreame_ui.mode.manual_section",i)}
                                            </div>
                                            ${f.map(e=>this._renderChoice(e))}`:B}
                          </div>
                      `:B}
        `}_renderChoice(e){return q`
            <button
                type="button"
                class="menu-item"
                role="option"
                aria-selected="${e.selected?"true":"false"}"
                @click="${()=>this._selectChoice(e)}"
            >
                <span class="menu-item-icons">
                    ${e.icons.map(e=>q`<ha-icon class="menu-item-icon" icon="${e}"></ha-icon>`)}
                </span>
                <span class="menu-item-label">${e.label}</span>
                ${e.selected?q`<ha-icon class="menu-item-check" icon="mdi:check"></ha-icon>`:B}
            </button>
        `}static get styles(){return r`
            :host {
                display: block;
                position: relative;
                padding: var(--dvc-chip-host-padding, 2px 14px);
            }

            .mode-chip {
                display: flex;
                align-items: center;
                gap: var(--dvc-chip-gap, 7px);
                width: fit-content;
                background: var(--dvc-glass-tint, var(--secondary-background-color, rgba(0, 0, 0, 0.1)));
                -webkit-backdrop-filter: var(--dvc-glass-blur);
                backdrop-filter: var(--dvc-glass-blur);
                border: 0.5px solid var(--dvc-hairline, transparent);
                box-shadow: var(--dvc-shadow-1);
                border-radius: var(--dvc-radius-pill, 980px);
                padding: var(--dvc-chip-padding, 5px 11px 5px 7px);
                cursor: pointer;
                transition:
                    transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    filter var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    box-shadow var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    opacity var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
                will-change: transform;
            }

            @media (hover: hover) {
                .mode-chip:hover {
                    filter: brightness(1.03);
                }
            }

            .mode-chip:active {
                transform: scale(0.97);
                filter: brightness(0.96);
            }

            .mode-chip:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            .mode-chip.unavailable {
                opacity: 0.45;
                cursor: default;
                box-shadow: none;
            }

            /* Bulle teintée autour des icônes de mode : structure la puce, à la iOS Settings. */
            .mode-icons {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2px;
                padding: 3px 5px;
                border-radius: var(--dvc-radius-pill, 980px);
                background: color-mix(in oklab, var(--primary-color, #0a84ff) 12%, transparent);
            }

            .mode-icon {
                color: var(--primary-color);
                --mdc-icon-size: 15px;
            }

            .mode-label {
                font-size: var(--dvc-chip-font-size, 13px);
                font-weight: 510;
                letter-spacing: -0.01em;
                color: var(--primary-text-color);
                white-space: nowrap;
            }

            .mode-arrow {
                color: var(--secondary-text-color);
                --mdc-icon-size: 16px;
                transition: transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }

            .mode-arrow.open {
                transform: rotate(180deg);
            }

            /* --- Menu de sélection ------------------------------------------------ */

            .menu-backdrop {
                position: fixed;
                inset: 0;
                z-index: 6;
            }

            .mode-menu {
                position: absolute;
                left: var(--dvc-chip-menu-inset, 14px);
                bottom: calc(100% + 4px);
                min-width: 230px;
                max-width: calc(100% - 2 * var(--dvc-chip-menu-inset, 14px));
                z-index: 7;
                padding: 5px;
                /* Surface OPAQUE du thème (convention des dialogs HA) : le menu flotte
                   au-dessus de la map, un fond dérivé de --ha-card-background serait
                   illisible sur les thèmes à cartes translucides. */
                background: color-mix(in oklab, var(--card-background-color, #fff) 94%, transparent);
                -webkit-backdrop-filter: var(--dvc-glass-blur);
                backdrop-filter: var(--dvc-glass-blur);
                border: 0.5px solid var(--dvc-hairline, transparent);
                border-radius: 16px;
                box-shadow: var(--dvc-shadow-2);
                transform-origin: bottom left;
                animation: dvc-menu-in 200ms var(--dvc-ease, cubic-bezier(0.32, 0.72, 0, 1));
            }

            @keyframes dvc-menu-in {
                from {
                    opacity: 0;
                    transform: translateY(4px) scale(0.97);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .menu-section {
                padding: 6px 10px 3px;
                font-size: 10.5px;
                font-weight: 600;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                color: var(--secondary-text-color);
            }

            .menu-item {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 7px 10px;
                border: none;
                border-radius: 10px;
                background: transparent;
                font-family: inherit;
                font-size: 13px;
                font-weight: 510;
                letter-spacing: -0.01em;
                color: var(--primary-text-color);
                text-align: left;
                cursor: pointer;
                transition: background var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }

            @media (hover: hover) {
                .menu-item:hover {
                    background: color-mix(in oklab, var(--primary-text-color, #000) 6%, transparent);
                }
            }

            .menu-item:active {
                background: color-mix(in oklab, var(--primary-text-color, #000) 10%, transparent);
            }

            .menu-item:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: -2px;
            }

            .menu-item-icons {
                display: flex;
                align-items: center;
                gap: 2px;
            }

            .menu-item-icon {
                color: var(--secondary-text-color);
                --mdc-icon-size: 16px;
            }

            .menu-item[aria-selected="true"] .menu-item-icon {
                color: var(--primary-color);
            }

            .menu-item-label {
                flex: 1;
            }

            .menu-item-check {
                color: var(--primary-color);
                --mdc-icon-size: 16px;
            }

            @media (prefers-reduced-motion: reduce) {
                .mode-menu {
                    animation: none;
                }
                .mode-chip,
                .mode-arrow,
                .menu-item {
                    transition: none;
                }
            }
        `}};var xs;e([ge({attribute:!1})],ks.prototype,"hass",void 0),e([ge({attribute:!1})],ks.prototype,"entityId",void 0),e([_e()],ks.prototype,"_menuOpen",void 0),ks=e([ue("dreame-cleaning-mode-chip")],ks);let zs=class extends ce{constructor(){super(...arguments),this.activeTab="room",this.language=""}static{xs=this}static get styles(){return r`
            :host {
                display: block;
            }
            /* Segmented control façon iOS : track arrondi, pilule active qui GLISSE
               d'un segment à l'autre (indicateur décoratif sous les boutons — la
               géométrie/hit-zone des onglets ne change pas). */
            .tabs {
                position: relative;
                display: flex;
                gap: 4px;
                margin: 10px 14px 4px;
                padding: 3px;
                background: color-mix(in oklab, var(--primary-text-color, #000) 6%, transparent);
                border: 0.5px solid var(--dvc-hairline, transparent);
                border-radius: 14px;
            }
            .tab-indicator {
                position: absolute;
                top: 3px;
                bottom: 3px;
                left: 3px;
                /* 3 segments : largeur = (track - 2×3px padding - 2×4px gaps) / 3 ;
                   le pas de glissement = sa propre largeur + le gap. */
                width: calc((100% - 6px - 8px) / 3);
                border-radius: 11px;
                background: var(--dvc-glass-tint-strong, var(--card-background-color, #fff));
                box-shadow: var(--dvc-shadow-1);
                transform: translateX(calc(var(--dvc-tab-index, 0) * (100% + 4px)));
                transition: transform 280ms var(--dvc-ease, cubic-bezier(0.32, 0.72, 0, 1));
                will-change: transform;
                pointer-events: none;
            }
            .tab {
                flex: 1;
                padding: 7px 4px;
                text-align: center;
                cursor: pointer;
                background: transparent;
                border: none;
                border-radius: 11px;
                color: var(--secondary-text-color);
                font-size: var(--dvc-tab-font-size, 14px);
                font-weight: 510;
                letter-spacing: -0.01em;
                font-family: inherit;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--dvc-tab-gap, 4px);
                -webkit-tap-highlight-color: transparent;
                position: relative;
                z-index: 1;
                transition:
                    color var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }
            @media (hover: hover) {
                .tab:not(.active):hover {
                    color: var(--primary-text-color);
                }
            }
            .tab:active {
                transform: scale(0.96);
            }
            .tab:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
                border-radius: var(--dvc-radius-pill, 980px);
            }
            .tab.active {
                color: var(--primary-text-color);
                font-weight: 600;
            }
            .tab.active ha-icon {
                color: var(--primary-color);
            }
            .tab ha-icon {
                --mdc-icon-size: var(--dvc-tab-icon-size, 20px);
            }
            @media (prefers-reduced-motion: reduce) {
                .tab-indicator {
                    transition: none;
                }
            }
        `}static{this._TAB_ORDER=["room","all","zone"]}render(){const e=Math.max(0,xs._TAB_ORDER.indexOf(this.activeTab));return q`
            <div
                class="tabs"
                part="tabs"
                role="tablist"
                style="--dvc-tab-index: ${e}"
                @keydown=${this._handleTablistKeydown}
            >
                <div class="tab-indicator" aria-hidden="true"></div>
                <button
                    class="tab ${"room"===this.activeTab?"active":""}"
                    part="tab tab-room${"room"===this.activeTab?" tab-active":""}"
                    role="tab"
                    aria-selected=${"room"===this.activeTab}
                    tabindex=${"room"===this.activeTab?"0":"-1"}
                    @click=${()=>this._selectTab("room")}
                >
                    <ha-icon icon="mdi:floor-plan"></ha-icon>
                    ${ho("dreame_ui.tab.room",this.language)}
                </button>
                <button
                    class="tab ${"all"===this.activeTab?"active":""}"
                    part="tab tab-all${"all"===this.activeTab?" tab-active":""}"
                    role="tab"
                    aria-selected=${"all"===this.activeTab}
                    tabindex=${"all"===this.activeTab?"0":"-1"}
                    @click=${()=>this._selectTab("all")}
                >
                    <ha-icon icon="mdi:home"></ha-icon>
                    ${ho("dreame_ui.tab.all",this.language)}
                </button>
                <button
                    class="tab ${"zone"===this.activeTab?"active":""}"
                    part="tab tab-zone${"zone"===this.activeTab?" tab-active":""}"
                    role="tab"
                    aria-selected=${"zone"===this.activeTab}
                    tabindex=${"zone"===this.activeTab?"0":"-1"}
                    @click=${()=>this._selectTab("zone")}
                >
                    <ha-icon icon="mdi:select-drag"></ha-icon>
                    ${ho("dreame_ui.tab.zone",this.language)}
                </button>
            </div>
        `}_handleTablistKeydown(e){const t=xs._TAB_ORDER,a=t.indexOf(this.activeTab);let i;switch(e.key){case"ArrowRight":i=(a+1)%t.length;break;case"ArrowLeft":i=(a-1+t.length)%t.length;break;case"Home":i=0;break;case"End":i=t.length-1;break;default:return}e.preventDefault(),this._selectTab(t[i]),this.updateComplete.then(()=>{(this.shadowRoot?.querySelectorAll(".tab")??[])[i]?.focus()})}_selectTab(e){this.activeTab!==e&&(this.activeTab=e,this.dispatchEvent(new CustomEvent("tab-changed",{detail:{tab:e},bubbles:!0,composed:!0})))}};e([ge({type:String})],zs.prototype,"activeTab",void 0),e([ge({type:String})],zs.prototype,"language",void 0),zs=xs=e([ue("dreame-tab-selector")],zs);let ws=class extends ce{constructor(){super(...arguments),this.activeTab="all",this.hasSelection=!1,this.selectionCount=0,this.canAppendRooms=!1}_callService(e){this.hass&&this.entityId&&(be("light"),this.hass.callService("vacuum",e,void 0,{entity_id:this.entityId}).then(()=>be("success"),()=>be("failure")))}_fireEvent(e){be("light"),this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0}))}get _lang(){return this.hass?.locale?.language??""}_getSelectionButtons(){const e=this.selectionCount>0?` (${this.selectionCount})`:"";return[this.canAppendRooms?{label:`${ho("dreame_ui.action.append",this._lang)}${e}`,icon:"mdi:plus",cssClass:"primary",action:()=>this._fireEvent("action-append")}:{label:`${ho("dreame_ui.action.clean",this._lang)}${e}`,icon:"mdi:play",cssClass:"primary",action:()=>this._fireEvent("action-run")},{label:ho("dreame_ui.action.cancel",this._lang),icon:"mdi:close",cssClass:"secondary",action:()=>this._fireEvent("action-cancel")}]}_getStateButtons(e){const t=this._lang;switch(e){case"cleaning":case"segment_cleaning":case"zoned_cleaning":return[{label:ho("dreame_ui.action.pause",t),icon:"mdi:pause",cssClass:"primary warning",action:()=>this._callService("pause")},{label:ho("dreame_ui.action.stop",t),icon:"mdi:stop",cssClass:"secondary",action:()=>this._callService("stop")}];case"paused":return[{label:ho("dreame_ui.action.resume",t),icon:"mdi:play",cssClass:"primary",action:()=>this._callService("start")},{label:ho("dreame_ui.action.stop",t),icon:"mdi:stop",cssClass:"secondary",action:()=>this._callService("stop")}];default:return[{label:ho("dreame_ui.action.clean",t),icon:"mdi:play",cssClass:"primary",action:()=>this._callService("start")},{label:ho("dreame_ui.action.dock",t),icon:"mdi:eject",cssClass:"secondary",action:()=>this._callService("return_to_base")}]}}shouldUpdate(e){return Xo(e,this.hass,[this.entityId])}render(){if(!this.hass||!this.entityId)return B;const e=this.hass.states[this.entityId];if(!e)return B;const t=e.state,a=("room"===this.activeTab||"zone"===this.activeTab)&&this.hasSelection,[i,n]=a?this._getSelectionButtons():this._getStateButtons(t);return q`
            <div class="actions" part="actions">
                <button
                    type="button"
                    class="action-btn ${i.cssClass}"
                    part="action-btn action-btn-primary"
                    aria-label=${i.label}
                    @click=${i.action}
                >
                    <ha-icon .icon=${i.icon}></ha-icon>
                    ${i.label}
                </button>
                <button
                    type="button"
                    class="action-btn ${n.cssClass}"
                    part="action-btn action-btn-secondary"
                    aria-label=${n.label}
                    @click=${n.action}
                >
                    <ha-icon .icon=${n.icon}></ha-icon>
                    ${n.label}
                </button>
            </div>
        `}static get styles(){return r`
            :host {
                display: block;
                padding: var(--dvc-action-host-padding, 8px 16px 16px);
            }

            .actions {
                display: flex;
                gap: var(--dvc-action-gap, 12px);
            }

            .action-btn {
                flex: 1;
                min-height: 48px;
                padding: var(--dvc-action-btn-padding, 14px);
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--dvc-action-icon-gap, 8px);
                border: none;
                cursor: pointer;
                font-size: var(--dvc-action-font-size, 15px);
                font-weight: 590;
                letter-spacing: -0.01em;
                font-family: inherit;
                -webkit-tap-highlight-color: transparent;
                transition:
                    transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    box-shadow var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    filter var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
                will-change: transform;
            }

            .action-btn:active {
                transform: scale(0.97);
                filter: brightness(0.95);
            }

            @media (hover: hover) {
                .action-btn:hover {
                    filter: brightness(1.04);
                    transform: translateY(-1px);
                }
                .action-btn:hover:active {
                    transform: scale(0.97);
                }
            }

            /* Glow coloré sous le bouton d'action : l'ombre reprend la teinte du fond
               (vert action / orange pause / rouge stop) — signature visuelle Apple. */
            .action-btn.primary {
                --dvc-btn-tint: var(--dvc-action-primary-bg, var(--success-color, #4ade80));
                background: linear-gradient(
                    180deg,
                    color-mix(in oklab, var(--dvc-btn-tint) 88%, #fff) 0%,
                    var(--dvc-btn-tint) 100%
                );
                color: var(--dvc-action-primary-fg, var(--text-primary-color, #000));
                /* Hairline teintée : même langage de bordure que les surfaces en verre. */
                border: 0.5px solid color-mix(in oklab, var(--dvc-btn-tint) 62%, #fff);
                box-shadow:
                    0 1px 2px rgba(0, 0, 0, 0.06),
                    0 8px 20px color-mix(in oklab, var(--dvc-btn-tint) 32%, transparent),
                    inset 0 1px 0 rgba(255, 255, 255, 0.22);
            }

            .action-btn.primary.warning {
                --dvc-btn-tint: var(--dvc-action-warning-bg, var(--warning-color, #f59e0b));
                color: var(--dvc-action-warning-fg, var(--text-primary-color, #000));
            }

            .action-btn.primary.danger {
                --dvc-btn-tint: var(--dvc-action-danger-bg, var(--error-color, #ef4444));
                color: var(--dvc-action-danger-fg, var(--text-primary-color, #fff));
            }

            /* Secondaire en verre, comme les chips/onglets : un aplat
               --secondary-background-color jurait sur les thèmes translucides. */
            .action-btn.secondary {
                background: var(--dvc-glass-tint, color-mix(in oklab, var(--primary-text-color, #000) 7%, transparent));
                -webkit-backdrop-filter: var(--dvc-glass-blur);
                backdrop-filter: var(--dvc-glass-blur);
                color: var(--primary-text-color);
                border: 0.5px solid var(--dvc-hairline);
                box-shadow: var(--dvc-shadow-1);
            }

            .action-btn:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            .action-btn ha-icon {
                --mdc-icon-size: var(--dvc-action-icon-size, 20px);
            }
        `}};e([ge({attribute:!1})],ws.prototype,"hass",void 0),e([ge({type:String})],ws.prototype,"entityId",void 0),e([ge({type:String})],ws.prototype,"activeTab",void 0),e([ge({type:Boolean})],ws.prototype,"hasSelection",void 0),e([ge({type:Number})],ws.prototype,"selectionCount",void 0),e([ge({type:Boolean})],ws.prototype,"canAppendRooms",void 0),ws=e([ue("dreame-action-buttons")],ws);let As=class extends ce{constructor(){super(...arguments),this._progressEntityId=void 0,this._lastEntityId=void 0}_findProgressEntity(){if(!this.hass||!this.entityId)return null;const e=this.hass.entities?.[this.entityId]?.device_id;if(!e)return null;for(const[t,a]of Object.entries(this.hass.entities))if(a.device_id===e&&t.startsWith("sensor.")&&t.endsWith("_cleaning_progress"))return t;return null}shouldUpdate(e){return Xo(e,this.hass,[this.entityId,this._progressEntityId])}render(){if(!this.hass||!this.entityId)return B;if(void 0!==this._progressEntityId&&this._lastEntityId===this.entityId||(this._lastEntityId=this.entityId,this._progressEntityId=this._findProgressEntity()),!this._progressEntityId)return B;const e=this.hass.states[this._progressEntityId];if(!e)return B;const t=Number(e.state);return isNaN(t)||t<=0?B:q`
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(t,100)}%"></div>
                </div>
                <span class="progress-text">${Math.round(t)}%</span>
            </div>
        `}static get styles(){return r`
            :host {
                display: block;
                padding: var(--dvc-progress-host-padding, 0 16px 4px);
            }

            .progress-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .progress-bar {
                flex: 1;
                height: 6px;
                background: color-mix(in oklab, var(--primary-text-color, #000) 10%, transparent);
                border-radius: 980px;
                overflow: hidden;
            }

            .progress-fill {
                position: relative;
                overflow: hidden;
                height: 100%;
                border-radius: 980px;
                background: linear-gradient(
                    90deg,
                    color-mix(
                        in oklab,
                        var(--map-card-internal-primary-color, var(--primary-color, #0a84ff)) 78%,
                        #fff
                    ),
                    var(--map-card-internal-primary-color, var(--primary-color, #0a84ff))
                );
                box-shadow: 0 0 8px
                    color-mix(
                        in srgb,
                        var(--map-card-internal-primary-color, var(--primary-color, #0a84ff)) 45%,
                        transparent
                    );
                transition: width 0.8s var(--dvc-ease, ease);
            }

            /* Reflet qui balaie doucement le remplissage (progression "vivante"). */
            .progress-fill::after {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.35) 50%, transparent 80%);
                background-size: 200% 100%;
                animation: dvc-progress-shimmer 2.4s ease-in-out infinite;
                animation-play-state: var(--dvc-anim-state, running);
            }

            @keyframes dvc-progress-shimmer {
                0% {
                    background-position: 150% 0;
                }
                100% {
                    background-position: -50% 0;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .progress-fill::after {
                    animation: none;
                    background: none;
                }
            }

            .progress-text {
                font-size: var(--dvc-progress-font-size, 12px);
                font-weight: 590;
                letter-spacing: -0.01em;
                font-variant-numeric: tabular-nums;
                color: var(--primary-text-color);
                min-width: 36px;
                text-align: right;
            }
        `}};e([ge({attribute:!1})],As.prototype,"hass",void 0),e([ge({type:String})],As.prototype,"entityId",void 0),As=e([ue("dreame-cleaning-progress-bar")],As);const Es=()=>import("./dreame-vacuum-card.anim_drying-B6Xz8GmK.js").then(e=>e.default),Ss=()=>import("./dreame-vacuum-card.anim_washing-C2fKmZRx.js").then(e=>e.default),Ps=()=>import("./dreame-vacuum-card.anim_dust_collect-Dx2ZyGXg.js").then(e=>e.default),Cs={drying:Es,dust_bag_drying:Es,dust_bag_drying_paused:Es,sanitizing_with_dry:Es,washing:Ss,washing_paused:Ss,clean_add_water:Ss,station_cleaning:Ss,sanitizing:Ss,initial_deep_cleaning:Ss,initial_deep_cleaning_paused:Ss,auto_emptying:Ps,emptying:Ps},Ms=new Set(["charging","charging_completed","idle"]);let Ts,Rs=class extends ce{constructor(){super(...arguments),this.robotState="",this.chargerX=-1,this.chargerY=-1,this._animation=null,this._currentState="",this._loadedState="",this._timerId=0,this._pendingState=null}willUpdate(){this._currentState=this.robotState?.toLowerCase()??""}connectedCallback(){super.connectedCallback(),this._pendingState&&!this._animation&&this._scheduleLoad(this._pendingState)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this._timerId),this._destroyAnimation()}updated(){if(this._currentState===this._loadedState)return;this._loadedState=this._currentState,this._destroyAnimation(),clearTimeout(this._timerId);const e=Cs[this._currentState],t=Ms.has(this._currentState);if(!e&&!t)return this._pendingState=null,void(this.style.opacity="0");this.style.opacity="1",e&&(this._pendingState=this._currentState,this._scheduleLoad(this._currentState))}_scheduleLoad(e,t=40){clearTimeout(this._timerId),this._timerId=window.setTimeout(()=>{if(!this.isConnected)return;const a=this.shadowRoot?.getElementById("lottie-container");if(!a)return void(t>0&&this._scheduleLoad(e,t-1));const i=Cs[e];i&&Promise.all([(Ts??=import("./dreame-vacuum-card.lottie_light-DGNgKIne.js").then(function(e){return e.l}).then(e=>e.default),Ts),i()]).then(([a,i])=>{if(!this.isConnected||this._currentState!==e)return;const n=this.shadowRoot?.getElementById("lottie-container");if(n)try{this._animation=a.loadAnimation({container:n,renderer:"svg",loop:!0,autoplay:!0,animationData:i}),this._pendingState=null}catch{t>0&&this._scheduleLoad(e,t-1)}else t>0&&this._scheduleLoad(e,t-1)}).catch(()=>{t>0&&this._scheduleLoad(e,t-1)})},50)}_destroyAnimation(){this._animation&&(this._animation.destroy(),this._animation=null)}render(){const e=this.chargerX>=0&&this.chargerY>=0,t=e?`left: ${this.chargerX}%; top: ${this.chargerY}%;`:"",a=this._currentState,i=Ms.has(a);return q`<div id="lottie-wrapper" class="${e?"positioned":"centered"}" style="${t}">
            ${Cs[a]?q`<div id="lottie-container"></div>`:B}
            ${i?q`<div class="zzz-container">
                          <span class="z z1">Z</span>
                          <span class="z z2">Z</span>
                          <span class="z z3">Z</span>
                      </div>`:B}
        </div>`}static get styles(){return r`
            :host {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 3;
                pointer-events: none;
                opacity: 0;
                transition: opacity 280ms var(--dvc-ease, ease);
            }

            #lottie-wrapper.centered {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            #lottie-wrapper.positioned {
                position: absolute;
                transform: translate(-50%, -110%);
            }

            #lottie-container {
                width: 48px;
                opacity: 0.9;
            }

            .zzz-container {
                position: relative;
                width: 40px;
                height: 48px;
            }

            .z {
                position: absolute;
                font-weight: 700;
                color: rgba(255, 255, 255, 0.85);
                text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
                animation: zzz-float 2.4s ease-in-out infinite;
                animation-play-state: var(--dvc-anim-state, running);
                opacity: 0;
            }

            .z1 {
                font-size: 10px;
                bottom: 0;
                left: 8px;
                animation-delay: 0s;
            }

            .z2 {
                font-size: 14px;
                bottom: 14px;
                left: 18px;
                animation-delay: 0.8s;
            }

            .z3 {
                font-size: 18px;
                bottom: 28px;
                left: 26px;
                animation-delay: 1.6s;
            }

            @keyframes zzz-float {
                0% {
                    opacity: 0;
                    transform: translateY(4px) scale(0.8);
                }
                20% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                80% {
                    opacity: 1;
                    transform: translateY(-6px) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.8);
                }
            }
        `}};e([ge({type:String})],Rs.prototype,"robotState",void 0),e([ge({type:Number})],Rs.prototype,"chargerX",void 0),e([ge({type:Number})],Rs.prototype,"chargerY",void 0),Rs=e([ue("dreame-robot-animation")],Rs);let js=class extends ce{constructor(){super(...arguments),this.xPercent=-1,this.yPercent=-1,this.headingDeg=0,this.visible=!1,this.active=!1,this.transitionMs=400}render(){if(!this.visible||this.xPercent<0||this.yPercent<0)return B;const e=`left: ${this.xPercent}%; top: ${this.yPercent}%; --rm-glide: ${this.transitionMs}ms;`,t=`transform: rotate(${this.headingDeg}deg);`;return q`<div id="marker" style="${e}">
            <div id="icon" style="${t}">
                ${this.iconUrl?q`<img id="robot-img" src="${this.iconUrl}" alt="" />`:q`<svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
                              <!-- Robot aspirateur vu de dessus, orienté vers +x à rotate(0) :
                               halo de contraste, corps, pare-chocs avant (cap) et tourelle lidar. -->
                              <circle cx="16" cy="16" r="14" class="halo" />
                              <circle cx="16" cy="16" r="12.4" class="body" />
                              <path class="beak" d="M 24.8 8.9 A 11.3 11.3 0 0 1 24.8 23.1" />
                              <circle cx="16" cy="16" r="5.2" class="lidar" />
                              <circle cx="16" cy="16" r="2.4" class="lidar-dot" />
                          </svg>`}
            </div>
        </div>`}static get styles(){return r`
            :host {
                position: absolute;
                inset: 0;
                z-index: 3;
                pointer-events: none;
            }

            #marker {
                position: absolute;
                width: 0;
                height: 0;
                /* translate(-50%,-50%) : centre l'icône sur le point ; la transition sur
                   left/top interpole les mises à jour discrètes en glissement fluide.
                   La durée est pilotée par la carte (--rm-glide) : elle mesure la cadence
                   réelle des échantillons vacuum_position (~3 s, push cloud Dreame) et fait
                   glisser le marqueur sur presque tout l'intervalle — mouvement continu au
                   lieu d'un à-coup de 0,4 s suivi d'une pause. linear voulu : vitesse
                   constante entre deux points de passage (un easing ferait « élastiquer »). */
                transform: translate(-50%, -50%);
                transition:
                    left var(--rm-glide, 400ms) linear,
                    top var(--rm-glide, 400ms) linear;
                will-change: left, top;
            }

            #icon {
                position: absolute;
                left: -12px;
                top: -12px;
                width: 24px;
                height: 24px;
                transform-origin: center;
                transition: transform 0.4s linear;
                will-change: transform;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
            }

            #robot-img {
                display: block;
                width: 24px;
                height: 24px;
                object-fit: contain;
            }

            /* Halo de contraste : garde le robot lisible sur toutes les couleurs de sol. */
            .halo {
                fill: var(--map-card-robot-halo, rgba(255, 255, 255, 0.92));
            }

            /* Corps du robot (blanc cassé, façon Dreame) — surchargeable par thème. */
            .body {
                fill: var(--map-card-robot-body, #eceff1);
                stroke: rgba(0, 0, 0, 0.22);
                stroke-width: 0.75;
            }

            /* Pare-chocs avant en couleur d'accent : c'est lui qui indique le cap. */
            .beak {
                fill: none;
                stroke: var(--map-card-internal-primary-color, var(--primary-color, #03a9f4));
                stroke-width: 2.4;
                stroke-linecap: round;
            }

            .lidar {
                fill: var(--map-card-robot-lidar, #cfd4d9);
                stroke: rgba(0, 0, 0, 0.18);
                stroke-width: 0.6;
            }

            .lidar-dot {
                fill: var(--map-card-internal-primary-color, var(--primary-color, #03a9f4));
            }

            /* Sonar-like halo while the robot is actively cleaning (Find My-style, premium). */
            :host([active]) #icon::after {
                content: "";
                position: absolute;
                left: 50%;
                top: 50%;
                width: 22px;
                height: 22px;
                margin: -11px 0 0 -11px;
                border-radius: 50%;
                background: radial-gradient(
                    circle,
                    var(--map-card-internal-primary-color, var(--primary-color, #03a9f4)) 0%,
                    transparent 70%
                );
                z-index: -1;
                pointer-events: none;
                animation: dvc-robot-pulse 2.6s ease-out infinite;
                animation-play-state: var(--dvc-anim-state, running);
            }

            @keyframes dvc-robot-pulse {
                0% {
                    transform: scale(0.7);
                    opacity: 0.5;
                }
                70%,
                100% {
                    transform: scale(2.4);
                    opacity: 0;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                :host([active]) #icon::after {
                    animation: none;
                }
            }
        `}};var $s;e([ge({type:Number})],js.prototype,"xPercent",void 0),e([ge({type:Number})],js.prototype,"yPercent",void 0),e([ge({type:Number})],js.prototype,"headingDeg",void 0),e([ge({type:Boolean})],js.prototype,"visible",void 0),e([ge({type:Boolean,reflect:!0})],js.prototype,"active",void 0),e([ge({type:Number})],js.prototype,"transitionMs",void 0),e([ge({attribute:!1})],js.prototype,"iconUrl",void 0),js=e([ue("dreame-robot-marker")],js);const Ns={0:[121,170,255],1:[255,211,38],2:[141,210,255],3:[150,217,141]},Is=window;Is.customCards=Is.customCards||[],Is.customCards.push({type:yo,name:"Dreame Vacuum Card",description:ho("common.description"),preview:!0,documentationURL:"https://github.com/foXaCe/dreame-vacuum-card",getEntitySuggestion:function(e,t){if("vacuum"!==t.substring(0,t.indexOf(".")))return null;if(!e.states[t])return null;const a=function(e,t){const a=Object.keys(e.states).filter($r);if(0===a.length)return;const i=e?.entities?.[t]?.device_id;if(i){const t=a.find(t=>e?.entities?.[t]?.device_id===i);if(t)return t}const n=a.find(t=>e?.states[t]?.attributes?.calibration_points);return n??a[0]}(e,t);return a?{config:Nr(a,t)}:null}});let Ls=class extends ce{static{$s=this}get _pickCanvas(){return this._roomPickEngine.currentPickCanvas}constructor(){super(),this.oldConfig=!1,this.repeats=1,this.selectedMode=0,this.activeTab="all",this.mapLocked=!0,this.configErrors=[],this.connected=!1,this.mapLoaded=!1,this.internalVariables={},this.watchedEntities=[],this.selectedManualRectangles=[],this.selectedManualPath=new jr([],this._getContext()),this.selectedPredefinedRectangles=[],this.selectedRooms=[],this.selectedPredefinedPoints=[],this.selectablePredefinedRectangles=[],this.selectableRooms=[],this.selectablePredefinedPoints=[],this.entitiesToManuallyUpdate=[],this.modes=[],this.isInEditor=!1,this._mapImageBuffer=new es({resolveUrl:e=>this.hass.hassUrl(e),onSwapped:()=>this.requestUpdate()}),this._overlayDirty=!1,this._roomPickEngine=new ts({getMapImage:()=>this._getMapImage(),getCameraState:()=>this._getCameraState(),getConverter:()=>this.coordinatesConverter}),this._stateSensorId=void 0,this._stateSensorEntityKey=void 0,this._robotSample=Qr,this._lastRenderTs=0,this._activeRoomSelection=[],this._toggleMapLock=()=>{this.mapLocked=!this.mapLocked,be("selection")},this._cycleRepeats=()=>{const e=this._getCurrentMode()?.maxRepeats??3;this.repeats=this.repeats%e+1,be("selection"),this.requestUpdate()},this._initializeRoomsRetries=0,this._handleAutogeneratedConfigGet=this._handleAutogeneratedConfigGet.bind(this),this._handleRoomsConfigGet=this._handleRoomsConfigGet.bind(this),this._handleServiceCallGet=this._handleServiceCallGet.bind(this),this._handleLovelaceDomEvent=this._handleLovelaceDomEvent.bind(this)}get hass(){return this._hass}set hass(e){const t=!this._hass&&e;this._hass=e,this.lastHassUpdate=new Date,t&&this._firstHass()}static async getConfigElement(){return document.createElement(ko)}static getStubConfig(e){const t=Object.keys(e.states),a=t.filter(e=>{const t=e.substring(0,e.indexOf("."));return"camera"===t||"image"===t}),i=t.filter(e=>e.startsWith("vacuum."));if(0===a.length||0===i.length)return;const n=a.filter(t=>e?.states[t]?.attributes?.calibration_points);let o=n[0]??a[0],r=i[0];const s=e?.entities?.[o]?.device_id;if(s){const t=i.find(t=>e?.entities?.[t]?.device_id===s);t&&(r=t)}else{const t=e?.entities?.[r]?.device_id,i=t?a.find(a=>e?.entities?.[a]?.device_id===t):void 0;i&&(o=i)}return Nr(o,r)}setConfig(e){if(!e)throw new Error(this._localize("common.invalid_configuration"));this.config=e,dr.debug=e.debug??!1,function(e){return!(!e.map_image&&!e.map_camera)}(e)?this.oldConfig=!0:(this.configErrors=function(e){const t=[];return Kr(e,e.language).forEach(e=>t.push(e)),t.map(t=>ho(t,e.language))}(this.config),this.configErrors.length>0||(this.watchedEntities=ur(this.config),this._setPresetIndex(0,!1,!0),this.requestUpdate("config")))}getCardSize(){return 12}getGridOptions(){return{columns:12,min_columns:6,max_columns:12,rows:"auto",min_rows:6,max_rows:20}}getLayoutOptions(){return{grid_columns:4,grid_min_columns:2,grid_rows:10,grid_min_rows:6}}connectedCallback(){super.connectedCallback(),this._isInEditor()&&(window.addEventListener(zo,this._handleAutogeneratedConfigGet),window.addEventListener(wo,this._handleRoomsConfigGet),window.addEventListener(Ao,this._handleServiceCallGet),this.isInEditor=!0),document.addEventListener(Eo,this._handleLovelaceDomEvent),this.connected=!0,this._updateElements(),this._initializeRooms(),Yo(100).then(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this._isInEditor()&&(window.removeEventListener(zo,this._handleAutogeneratedConfigGet),window.removeEventListener(wo,this._handleRoomsConfigGet),window.removeEventListener(Ao,this._handleServiceCallGet)),document.removeEventListener(Eo,this._handleLovelaceDomEvent),this.connected=!1,void 0!==this._throttledRenderTimer&&(clearTimeout(this._throttledRenderTimer),this._throttledRenderTimer=void 0)}static{this._CLEANING_RENDER_MIN_MS=200}shouldUpdate(e){if(!this.config)return!1;const t=function(e,t,a,i){if(t.has("config"))return!0;const n=t.get("_hass");if(!n||e.some(e=>n.states[e]!==i?.states[e]))return!0;const o=Array.from(t.keys());return o.length>1||1===o.length&&"_hass"!==o[0]}(this.watchedEntities,e,0,this.hass);if(!t)return!1;const a=Array.from(e.keys());if(1===a.length&&"_hass"===a[0]&&this._isRobotActive()){const e=Date.now(),t=e-this._lastRenderTs;if(t<$s._CLEANING_RENDER_MIN_MS)return void 0===this._throttledRenderTimer&&(this._throttledRenderTimer=window.setTimeout(()=>{this._throttledRenderTimer=void 0,this.requestUpdate()},$s._CLEANING_RENDER_MIN_MS-t)),!1;this._lastRenderTs=e}return!0}_isRobotActive(){const e=this.currentPreset;if(!e?.entity)return!1;const t=this.hass?.states?.[e.entity]?.state;return!!t&&To.includes(t)}_resolveStateSensor(e){if(void 0!==this._stateSensorId&&this._stateSensorEntityKey===e)return this._stateSensorId;this._stateSensorEntityKey=e;const t=this.hass?.entities?.[e]?.device_id;if(!t)return this._stateSensorId=null,null;for(const[e,a]of Object.entries(this.hass.entities))if(a.device_id===t&&e.startsWith("sensor.")&&("state"===a.translation_key||e.endsWith("_state")))return this._stateSensorId=e,this.watchedEntities.includes(e)||this.watchedEntities.push(e),e;return this._stateSensorId=null,null}render(){if(this.oldConfig)return this._showOldConfig();if(this.configErrors.length>0)return this._showConfigErrors(this.configErrors);if(!this.hass)return;const e=function(e,t){const a=Object.keys(t.states);return e.filter(e=>!a.includes(e))}(this.watchedEntities,this.hass);if(e.length>0)return this._showInvalidEntities(e);const t=this._getCurrentPreset(),a=this._resolveStateSensor(t.entity),i=a?this.hass.states[a]?.state??"":"";this._updateCalibration(t);let n=-1,o=-1;if(this.coordinatesConverter?.calibrated&&t.map_source?.camera){const e=this.hass.states[t.map_source.camera],a=e?.attributes?.charger_position;if(a&&null!=a.x&&null!=a.y){const e=this.coordinatesConverter.vacuumToMap(a.x,a.y),t=this.realImageWidth,i=this.realImageHeight;t&&i&&(n=e[0]/t*100,o=e[1]/i*100)}}const r=t.robot_overlay??this.config?.robot_overlay,s=t.map_source?.camera?this.hass.states[t.map_source.camera]:void 0;let l;l="boolean"==typeof r?r:!1===s?.attributes?.robot_in_map;const c=function({camState:e,converter:t,natW:a,natH:i,robotOverlayEnabled:n,prevSample:o,nowMs:r}){let s,l=-1,c=-1,d=0,u=!1,m=o;if(n&&t?.calibrated&&e){s=e.attributes?.robot_icon;const n=e.attributes?.vacuum_position;if(n&&null!=n.x&&null!=n.y){const e=t.vacuumToMap(n.x,n.y);if(a&&i){l=e[0]/a*100,c=e[1]/i*100;const s=(n.a??0)*Math.PI/180,_=t.vacuumToMap(n.x+Math.cos(s),n.y+Math.sin(s));d=180*Math.atan2(_[1]-e[1],_[0]-e[0])/Math.PI,g=d,d=void 0!==(p=o.headingDeg)&&Number.isFinite(p)?p+(((g-p)%360+540)%360-180):g,u=!0;const h=`${n.x},${n.y}`;let v=o.glideMs,f=o.posTs;if(h!==o.posKey){if(void 0!==o.posKey){const e=r-o.posTs;v=Math.min(4e3,Math.max(400,Math.round(.9*e)))}f=r}m={posKey:h,posTs:f,glideMs:v,headingDeg:d}}}}var p,g;return{xPct:l,yPct:c,headingDeg:d,visible:u,iconUrl:s,glideMs:m.glideMs,nextSample:m}}({camState:s,converter:this.coordinatesConverter,natW:this.realImageWidth,natH:this.realImageHeight,robotOverlayEnabled:l,prevSample:this._robotSample,nowMs:Date.now()});this._robotSample=c.nextSample;const d=c.xPct,u=c.yPct,m=c.headingDeg,p=c.visible,g=c.iconUrl,_=this._getMapSrc(t),h=cr.getPlatformsWithDefaultCalibration().includes(cr.getPlatformName(t.vacuum_platform)),v=!!this.coordinatesConverter&&this.coordinatesConverter.calibrated||h,f=this._hasActiveSelection(),b=q`
            <div
                id="map-zoomer-content"
                style="
                 margin-top: ${-1*(t.map_source.crop?.top??0)}px;
                 margin-bottom: ${-1*(t.map_source.crop?.bottom??0)}px;
                 margin-left: ${-1*(t.map_source.crop?.left??0)}px;
                 margin-right: ${-1*(t.map_source.crop?.right??0)}px;"
            >
                <img
                    id="map-image"
                    alt="camera_image"
                    crossorigin="anonymous"
                    decoding="async"
                    loading="eager"
                    fetchpriority="high"
                    src="${_}"
                    @load="${()=>{this.mapLoaded=!0,this._calculateBasicScale(),this._buildPickCanvas()}}"
                />

                <canvas id="room-selection-overlay"></canvas>

                <div id="map-image-overlay">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="2.0"
                        id="svg-wrapper"
                        class="${"room"===this.activeTab?"room-mode":""}"
                        width="100%"
                        height="100%"
                        @mousedown="${e=>this._mouseDown(e)}"
                        @mousemove="${e=>this._mouseMove(e)}"
                        @mouseup="${e=>this._mouseUp(e)}"
                        @click="${e=>this._handleMapClick(e)}"
                    >
                        ${v?this._drawSelection():null}
                        ${v?this._drawRooms():null}
                    </svg>
                </div>
                <dreame-robot-animation
                    .robotState=${i}
                    .chargerX=${n}
                    .chargerY=${o}
                ></dreame-robot-animation>
                <dreame-robot-marker
                    .visible=${p}
                    .active=${this._isRobotActive()}
                    .xPercent=${d}
                    .yPercent=${u}
                    .headingDeg=${m}
                    .transitionMs=${c.glideMs}
                    .iconUrl=${g}
                ></dreame-robot-marker>
            </div>
        `;return q`
            <ha-card
                data-appearance="${this.config.appearance??"premium"}"
                style="--map-scale: ${this.mapScale}; --real-scale: ${this.realScale};"
            >
                <div class="map-wrapper ${this.config.show_title?"with-title":""}" part="map-wrapper">
                    <dreame-status-header
                        .hass=${this.hass}
                        .entityId=${t.entity}
                        .showTitle=${this.config.show_title??!1}
                    ></dreame-status-header>
                    <div class="map-container ${this.mapLoaded?"":"map-loading"}" part="map">
                        <pinch-zoom
                            min-scale="0.5"
                            id="map-zoomer"
                            @change="${this._calculateScale}"
                            two-finger-pan="${t.two_finger_pan}"
                            locked="${this.mapLocked}"
                            no-default-pan="${this.mapLocked||t.two_finger_pan}"
                            style="touch-action: none;"
                        >
                            ${b}
                        </pinch-zoom>
                        ${this.mapLoaded?null:q`<div id="map-skeleton" aria-hidden="true"></div>`}
                    </div>
                    <div id="map-zoomer-overlay">
                        <div class="map-zoom-icons">
                            <ha-icon
                                icon="${this.mapLocked?"mdi:lock":"mdi:lock-open-variant"}"
                                class="icon-on-map clickable ripple ${this.mapLocked?"lock-active":""}"
                                role="button"
                                tabindex="0"
                                aria-pressed="${this.mapLocked?"true":"false"}"
                                aria-label="${this._localize(this.mapLocked?"dreame_ui.map.unlock":"dreame_ui.map.lock")}"
                                @click="${this._toggleMapLock}"
                                @keydown="${e=>this._handleIconKey(e,this._toggleMapLock)}"
                            ></ha-icon>
                            ${"zone"===this.activeTab?q`
                                          <ha-icon
                                              icon="mdi:plus"
                                              class="icon-on-map clickable ripple"
                                              role="button"
                                              tabindex="0"
                                              aria-label="${this._localize("dreame_ui.map.add_rectangle")}"
                                              @click="${()=>this._addRectangle()}"
                                              @keydown="${e=>this._handleIconKey(e,()=>this._addRectangle())}"
                                          ></ha-icon>
                                      `:null}
                            ${"zone"===this.activeTab||"room"===this.activeTab?q`
                                          <div
                                              class="icon-on-map clickable ripple cycle-counter"
                                              role="button"
                                              tabindex="0"
                                              aria-label="${this._localize("dreame_ui.map.cycle_repeats")}"
                                              @click="${this._cycleRepeats}"
                                              @keydown="${e=>this._handleIconKey(e,this._cycleRepeats)}"
                                          >
                                              x${this.repeats}
                                          </div>
                                      `:null}
                            <ha-icon
                                icon="mdi:image-filter-center-focus"
                                class="icon-on-map clickable ripple"
                                role="button"
                                tabindex="0"
                                aria-label="${this._localize("dreame_ui.map.recenter")}"
                                @click="${this._restoreMap}"
                                @keydown="${e=>this._handleIconKey(e,this._restoreMap)}"
                            ></ha-icon>
                        </div>
                    </div>
                </div>
                ${Zo(!v,()=>this._showInvalidCalibrationWarning())}
                <dreame-cleaning-mode-chip .hass=${this.hass} .entityId=${t.entity}></dreame-cleaning-mode-chip>
                <dreame-tab-selector
                    .activeTab=${this.activeTab}
                    .language=${this.hass?.locale?.language??""}
                    @tab-changed=${e=>this._handleTabChange(e.detail.tab)}
                ></dreame-tab-selector>
                <dreame-cleaning-progress-bar
                    .hass=${this.hass}
                    .entityId=${t.entity}
                ></dreame-cleaning-progress-bar>
                <dreame-action-buttons
                    .hass=${this.hass}
                    .entityId=${t.entity}
                    .activeTab=${this.activeTab}
                    .hasSelection=${f}
                    .selectionCount=${this.selectedRooms.length+this.selectedPredefinedRectangles.length}
                    .canAppendRooms=${this._getRoomsInProgress().length>0&&"room"===this.activeTab}
                    @action-run=${()=>this._run(!1)}
                    @action-append=${()=>this._runAppend()}
                    @action-cancel=${()=>this._clearSelection()}
                ></dreame-action-buttons>
            </ha-card>
        `}_hasActiveSelection(){return this.selectedManualRectangles.length>0||this.selectedRooms.length>0||this.selectedPredefinedRectangles.length>0||this.selectedPredefinedPoints.length>0||!!this.selectedManualPoint}_handleTabChange(e){this.activeTab=e,this._clearSelection();const t=this.modes;switch(e){case"room":{const e=t.findIndex(e=>e.selectionType===fo.ROOM);e>=0&&this._setCurrentMode(e);break}case"zone":{const e=t.findIndex(e=>e.selectionType===fo.MANUAL_RECTANGLE);e>=0&&(this._setCurrentMode(e),this.updateComplete.then(()=>this._addRectangle()));break}}this._overlayDirty=!0,this.requestUpdate()}_clearSelection(){this.selectedManualRectangles=[],this.selectedManualPoint=void 0,this.selectedManualPath=new jr([],this._getContext()),this.selectedPredefinedRectangles.forEach(e=>e.deselect()),this.selectedPredefinedRectangles=[],this.selectedRooms.forEach(e=>e.deselect()),this.selectedRooms=[],this.selectedPredefinedPoints.forEach(e=>e.deselect()),this.selectedPredefinedPoints=[],this._overlayDirty=!0,this.requestUpdate()}updated(e){const t=e.get("_hass"),a=t&&this.hass&&function(e,t,a){return e.filter(e=>t.states[e]!==a.states[e]).length>0}(this.entitiesToManuallyUpdate,t,this.hass);this._updateElements(a),this._maybeResetActiveSelection(),this._overlayDirty&&(this._overlayDirty=!1,this._updateRoomSelectionOverlay())}_getCurrentPreset(){return this.currentPreset}_getCameraState(){const e=this._getCurrentPreset().map_source?.camera;return e?this.hass?.states[e]:void 0}_getCalibration(e){return function(e,t){if(e.calibration_source?.identity)return[{map:{x:0,y:0},vacuum:{x:0,y:0}},{map:{x:1,y:0},vacuum:{x:1,y:0}},{map:{x:0,y:1},vacuum:{x:0,y:1}}];if(e.calibration_source?.calibration_points&&[3,4].includes(e.calibration_source.calibration_points.length))return e.calibration_source.calibration_points;if(!t)return;if(e.calibration_source?.entity&&!e.calibration_source?.attribute)try{const a=t.states[e.calibration_source.entity]?.state;if(!a||"unavailable"===a||"unknown"===a)return;return JSON.parse(a)}catch{return}if(e.calibration_source?.entity&&e.calibration_source?.attribute)return t.states[e.calibration_source.entity]?.attributes[e.calibration_source.attribute];if(e.calibration_source?.camera)return t.states[e.map_source?.camera??""]?.attributes.calibration_points;if(e.calibration_source?.platform)return cr.getCalibration(e.calibration_source.platform);return cr.getCalibration(e.vacuum_platform)||void 0}(e,this.hass)}_firstHass(){0!==this.configErrors.length||this.oldConfig||this._setPresetIndex(0,!1,!0)}_setPresetIndex(e,t=!1,a=!1){if(e===this.presetIndex&&!a)return;const i=this.config;this.mapLocked||this._getPinchZoom()?.setTransform({scale:1,x:0,y:0,allowChangeEvent:!0}),t&&be("selection"),this.mapLocked=!0,this.selectedMode=0,this.realScale=1,this.mapScale=1,this.mapX=0,this.mapY=0,this._cachedContext=void 0,this.hass&&this._updateCalibration(i),this.modes=this._getModes(i),this.presetIndex=e,this.internalVariables=this._getInternalVariables(i),this._setPreset(i),this._setCurrentMode(0,!1),this._selectionChanged(),this.requestUpdate()}_getInternalVariables(e){return{...cr.getVariables(e.vacuum_platform)??{},...e.internal_variables??{}}}_getModes(e){const t=cr.getPlatformName(e.vacuum_platform);return(-1===(e.map_modes?.length??-1)?cr.generateDefaultModes(t):e.map_modes??[$o]).map(e=>new dr(t,e,this.config.language))}_setPreset(e){this.currentPreset?.map_source?.camera!==e.map_source?.camera&&(this._mapImageBuffer.reset(),this.mapLoaded=!1,this._robotSample={...this._robotSample,headingDeg:void 0}),this.currentPreset=e,this.watchedEntities=ur(e)}_updateCalibration(e){const t=this._getCalibration(e),a=t?JSON.stringify(t):"none";a===this._lastCalibrationKey&&this.coordinatesConverter||(this._lastCalibrationKey=a,this.coordinatesConverter=new Jr(t))}_getMapSrc(e){const t=e.map_source.camera?this.hass?.states?.[e.map_source.camera]:void 0,a=t?.attributes?.entity_picture,i=!!this.connected&&!!this.lastHassUpdate&&this.lastHassUpdate.getTime()+36e4>=(new Date).getTime();return this._mapImageBuffer.resolveSrc({mapSource:e.map_source,cameraEntityPicture:a,isFresh:i})}_getContext(){return this._cachedContext||(this._cachedContext=new Cr({scale:()=>this.mapScale,realScale:()=>this.realScale,mousePositionCalculator:e=>this._getMousePosition(e),update:()=>this.requestUpdate(),selectionChanged:()=>this._selectionChanged(),coordinatesConverter:()=>this.coordinatesConverter,selectedManualRectangles:()=>this.selectedManualRectangles,selectedPredefinedRectangles:()=>this.selectedPredefinedRectangles,selectedRooms:()=>this.selectedRooms,selectedPredefinedPoint:()=>this.selectedPredefinedPoints,roundingEnabled:()=>this._getCurrentMode()?.coordinatesRounding??!1,coordinatesToMetersDivider:()=>this._getCurrentMode()?.coordinatesToMetersDivider??1,maxSelections:()=>this._getCurrentMode()?.maxSelections??0,runImmediately:()=>this._runImmediately(),localize:e=>this._localize(e),getState:e=>this._hass.states[e]?.state??"",toggleEntity:e=>this._hass.callService("homeassistant","toggle",void 0,{entity_id:e}),getCurrentMode:()=>this._getCurrentMode(),activateRoomMode:()=>this._activateRoomMode(),activeTab:()=>this.activeTab})),this._cachedContext}_getMousePosition(e){return Go(e,this._getSvgWrapper(),this.mapScale)}_setCurrentMode(e,t=!0){const a=this.modes[e];switch(this.selectedManualRectangles=[],this.selectedManualPoint=void 0,this.selectedManualPath.clear(),this.selectedPredefinedRectangles=[],this.selectableRooms.forEach(e=>{e.deselect()}),this.selectedRooms=[],this.selectedPredefinedPoints=[],this.selectablePredefinedRectangles=[],this.selectablePredefinedPoints=[],a?.selectionType){case fo.PREDEFINED_RECTANGLE:const e=Or.getFromEntities(a,this.hass,()=>this._getContext()),t=a.predefinedSelections.map(e=>e).filter(e=>"string"!=typeof e.zones).map(e=>new Or(e,this._getContext()));this.selectablePredefinedRectangles=e.concat(t),this.selectedPredefinedRectangles=this.selectablePredefinedRectangles.filter(e=>e.selected),this.entitiesToManuallyUpdate=a.predefinedSelections.filter(e=>e.state_entity).map(e=>e.state_entity);break;case fo.ROOM:0===this.selectableRooms.length&&(this.selectableRooms=a.predefinedSelections.map(e=>new Dr(e,this._getContext()))),this.selectedRooms=this.selectableRooms.filter(e=>e.selected),this.entitiesToManuallyUpdate=a.predefinedSelections.filter(e=>e.state_entity).map(e=>e.state_entity);break;case fo.PREDEFINED_POINT:const i=Lr.getFromEntities(a,this.hass,()=>this._getContext()),n=a.predefinedSelections.map(e=>e).filter(e=>"string"!=typeof e.position).map(e=>new Lr(e,this._getContext()));this.selectablePredefinedPoints=i.concat(n),this.selectedPredefinedPoints=this.selectablePredefinedPoints.filter(e=>e.selected),this.entitiesToManuallyUpdate=a.predefinedSelections.filter(e=>e.state_entity).map(e=>e.state_entity)}this.selectedMode!=e&&t&&be("selection"),this.selectedMode=e,this._selectionChanged()}_getCurrentMode(){return this.modes[this.selectedMode]}_getSelection(e){if(!e)return{selection:[],variables:{}};const t=e.repeatsType===bo.INTERNAL?this.repeats:null;let a=[],i={};const n=e=>({...e[0]?.variables??{},variables:e.map(e=>e?.variables??{})});switch(e.selectionType){case fo.MANUAL_RECTANGLE:a=this.selectedManualRectangles.map(e=>e.toVacuum(t)),i=n(this.selectedManualRectangles);break;case fo.PREDEFINED_RECTANGLE:a=this.selectedPredefinedRectangles.map(e=>e.toVacuum(t)).reduce((e,t)=>e.concat(t),[]),i=n(this.selectedPredefinedRectangles);break;case fo.ROOM:const o=this.selectedRooms.map(e=>e.toVacuum()).map(t=>$s.adjustRoomId(t,e));a=[...o,...t&&o.length>0?[t]:[]],i=n(this.selectedRooms);break;case fo.MANUAL_PATH:a=this.selectedManualPath.toVacuum(t),i=n([this.selectedManualPath]);break;case fo.MANUAL_POINT:a=this.selectedManualPoint?.toVacuum(t)??[],i=n([this.selectedManualPoint]);break;case fo.PREDEFINED_POINT:a=this.selectedPredefinedPoints.map(e=>e.toVacuum(t)).reduce((e,t)=>e.concat(t),[]),i=n(this.selectedPredefinedPoints)}return e.repeatsType===bo.REPEAT&&(a=Array(this.repeats).fill(0).flatMap(()=>a)),{selection:a,variables:i}}async _runImmediately(){return!!this._getCurrentMode()?.runImmediately&&(await this._run(!1),!0)}_selectionChanged(){const e=this._getCurrentMode(),{selection:t}=this._getSelection(e);if(this.isInEditor){const e=new Event("map-card-selection-changed");e.selection=t??"[]",window.dispatchEvent(e)}this._overlayDirty=!0,this.requestUpdate()}_isInEditor(){return function e(t){return"hui-card"===t.parentElement?.tagName?.toLowerCase()&&"preview"in(t.parentElement?.attributes??[])||"hui-section"===t.parentElement?.tagName?.toLowerCase()&&"preview"in(t.parentElement?.attributes??[])||"hui-card-preview"===t.parentElement?.tagName?.toLowerCase()||null!=t.parentElement&&e(t.parentElement)||"[object ShadowRoot]"==t.parentNode?.toString()&&e(t.getRootNode().host)}(this)}async _handleAutogeneratedConfigGet(){const e=new Event("map-card-autogenerated-config");e.presetConfig={...this.config,map_modes:this._getModes(this.config).map(e=>e.toMapModeConfig())},window.dispatchEvent(e)}_handleRoomsConfigGet(){const e=new Event("map-card-room-config");e.roomConfig=this._getRoomsConfig(),window.dispatchEvent(e)}async _handleServiceCallGet(){const e=this._getCurrentPreset(),t=this._getCurrentMode(),{selection:a,variables:i}=this._getSelection(t);if(0!==a.length&&t){const n=await t.getServiceCall(this.hass,e.entity,a,this.repeats,{...this.internalVariables,...i}),o=new Event("map-card-service-call");o.serviceCall=JSON.stringify(n,null,2),window.dispatchEvent(o)}else be("failure")}async _handleLovelaceDomEvent(e){const t=e;if(So in t.detail&&"action_handler_id"in t.detail[So]&&t.detail[So].action_handler_id===(this.config.action_handler_id??"this")){const e=t.detail[So];if(void 0===e.action)return;const a=e.action,i=e.data,n=this._getCurrentMode();switch(a){case Lo.CLEANING_START:await this._run(!1);break;case Lo.INTERNAL_VARIABLE_SET:i&&this._setInternalVariable(i.variable,i.value);break;case Lo.MAP_MODE_NEXT:this._setCurrentMode((this.selectedMode+1)%this.modes.length,!1);break;case Lo.MAP_MODE_PREVIOUS:this._setCurrentMode((this.selectedMode-1+this.modes.length)%this.modes.length,!1);break;case Lo.MAP_MODE_SET:i&&"number"==typeof i.index&&this._setCurrentMode(i.index%this.modes.length,!1);break;case Lo.REPEATS_DECREMENT:n&&(this.repeats=(this.repeats+n.maxRepeats-2)%n.maxRepeats+1);break;case Lo.REPEATS_INCREMENT:n&&(this.repeats=this.repeats%n.maxRepeats+1);break;case Lo.REPEATS_SET:if(n&&i&&Number.isFinite(Number(i.value))){const e=n.maxRepeats,t=Math.trunc(Number(i.value));this.repeats=((t-1)%e+e)%e+1}break;case Lo.SELECTION_CLEAR:this._setCurrentMode(this.selectedMode)}}}_setInternalVariable(e,t){const a={...this.internalVariables};a[e]=t,this.internalVariables=a,this.requestUpdate()}_getRoomsConfig(){if(!this.hass)return;const e=this._getCurrentPreset(),t=this.hass.states[e.map_source?.camera??""]?.attributes.rooms,a=new Array;if(t){const e=this.modes.filter(e=>e.selectionType===fo.ROOM).reverse()[0],i=e?this.modes.indexOf(e):-1;for(const e in t){if(!Object.prototype.hasOwnProperty.call(t,e))continue;const i=t[e];if(!(i.outline||i.x0||i.y0||i.x1||i.y1))continue;if("Hidden"===i.visibility)continue;const n=i.outline??[[i.x0,i.y0],[i.x1,i.y0],[i.x1,i.y1],[i.x0,i.y1]];let o=i.color??void 0;o||null==i.color_index||(o=Ns[i.color_index]),a.push({id:e,icon:void 0,label:void 0,outline:n,color:o,color_index:i.color_index??void 0})}return{modeIndex:i,rooms:a}}}static adjustRoomId(e,t){if("number"===t.idType){const t=+e;return isNaN(t)?e:t}return e}async _run(e,t=[]){const a=this._getCurrentPreset(),i=this._getCurrentMode(),{selection:n,variables:o}=this._getSelection(i);let r=n;const s=i?.selectionType===fo.ROOM;if(s&&t.length>0){const e=this.repeats,a=i.repeatsType===bo.INTERNAL,o=a?n.slice(0,-1):n,s=a?[e]:[],l=Array.from(new Set([...t,...o].map(e=>String(e)))).map(e=>{const t=Number(e);return Number.isNaN(t)?e:t});r=[...l,...s]}if(0!==r.length&&i){const t=this.repeats,n=await i.getServiceCall(this.hass,a.entity,r,t,{...this.internalVariables,...o});if(e||this.config.debug){const e=JSON.stringify(n,null,2);console.info("[dreame-vacuum-card] Appel de service (debug) :\n"+e),be("success")}else this.hass.callService(n.domain,n.service,n.serviceData,n.target).then(()=>{be("success"),s&&(this._activeRoomSelection=r.filter(e=>"string"==typeof e||"number"==typeof e).map(e=>e))},()=>{be("failure")})}else be("failure");(a.clean_selection_on_start??1)&&this._setCurrentMode(this.selectedMode),this._selectionChanged()}_runAppend(){return this._run(!1,this._getRoomsInProgress())}_getRoomsInProgress(){const e=new Set(this.selectableRooms.map(e=>String(e.toVacuum()))),t=this.currentPreset,a=t?.entity?this.hass?.states?.[t.entity]:void 0,i=a?.state;if(i&&Ro.includes(i)){const t=a?.attributes?.active_segments;if(Array.isArray(t)&&t.length>0){const a=t.map(e=>"number"==typeof e?e:Number(e)).filter(e=>Number.isFinite(e)).map(e=>String(e)).filter(t=>e.has(t));if(a.length>0)return a}}return 0===this._activeRoomSelection.length?[]:this._activeRoomSelection.filter(t=>e.has(String(t)))}_maybeResetActiveSelection(){const e=this.currentPreset;if(!e?.entity)return;const t=this.hass?.states?.[e.entity]?.state;t&&jo.includes(t)&&(this._activeRoomSelection=[])}_updateElements(e=!1){if(Yo(10).then(()=>this._calculateBasicScale()),!e)return;const t=()=>{this._setCurrentMode(this.selectedMode),this.requestUpdate()};switch(this._getCurrentMode()?.selectionType){case fo.PREDEFINED_RECTANGLE:this.selectablePredefinedRectangles.filter(e=>e.isDynamic()).length>0&&t();break;case fo.ROOM:this.selectedRooms.filter(e=>e.isDynamic()).length>0&&t();break;case fo.PREDEFINED_POINT:this.selectablePredefinedPoints.filter(e=>e.isDynamic()).length>0&&t()}}_handleMapClick(e){if("room"!==this.activeTab)return;const t=this._hitTestRoom(e);t&&(e.stopPropagation(),t.toggleFromHitTest())}_drawRooms(){return 0===this.selectableRooms.length?null:H`${this.selectableRooms.map(e=>e.renderLabelOnly())}`}_drawSelection(){if("all"===this.activeTab)return null;switch(this._getCurrentMode()?.selectionType){case fo.MANUAL_RECTANGLE:return H`${this.selectedManualRectangles.map(e=>e.render())}`;case fo.PREDEFINED_RECTANGLE:return H`${this.selectablePredefinedRectangles.map(e=>e.render())}`;case fo.ROOM:return null;case fo.MANUAL_PATH:return H`${this.selectedManualPath?.render()}`;case fo.MANUAL_POINT:return H`${this.selectedManualPoint?.render()}`;case fo.PREDEFINED_POINT:return H`${this.selectablePredefinedPoints.map(e=>e.render())}`;default:return null}}_addRectangle(){const e=this._getCurrentPreset(),t=this._getCurrentMode(),a=e.map_source.crop?.top??0,i=e.map_source.crop?.bottom??0,n=e.map_source.crop?.left??0,o=e.map_source.crop?.right??0;if(this._calculateBasicScale(),!t||this.selectedManualRectangles.length>=t.maxSelections)return void be("failure");const r=this.realImageHeight*this.realScale-a-i,s=this.realImageWidth*this.realScale-n-o,l=(this.selectedManualRectangles.length+1).toString(),c=(s/3+n-this.mapX)/this.mapScale,d=(r/3+a-this.mapY)/this.mapScale,u=s/3/this.mapScale,m=r/3/this.mapScale;this.selectedManualRectangles.push(new Pr(c,d,u,m,l,this._getContext())),this._selectionChanged(),be("selection"),this.requestUpdate()}_mouseDown(e){e instanceof MouseEvent&&0!=e.button||(this.shouldHandleMouseUp=!0)}_mouseMove(e){e.target.classList.contains("draggable")||(this.selectedManualRectangles.filter(e=>e.isSelected()).forEach(t=>t.externalDrag(e)),this.shouldHandleMouseUp=!1)}_mouseUp(e){if("all"===this.activeTab)return void(this.shouldHandleMouseUp=!1);const t=e.target;if((t?.getAttribute?.("class")??"").includes("room-polygon"))return void(this.shouldHandleMouseUp=!1);const a=this._getCurrentMode();if(!(e instanceof MouseEvent&&0!=e.button)&&this.shouldHandleMouseUp&&a){const{x:t,y:i}=Go(e,this._getSvgWrapper(),1);switch(a.selectionType){case fo.MANUAL_PATH:be("selection"),this.selectedManualPath.addPoint(t,i),this._selectionChanged(),Ho(e),this.requestUpdate();break;case fo.MANUAL_POINT:be("selection"),this.selectedManualPoint=new Tr(t,i,this._getContext()),this._selectionChanged(),Ho(e),this.requestUpdate()}}this.shouldHandleMouseUp=!1}_handleIconKey(e,t){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),t())}_restoreMap(){const e=this._getMapZoomerContent();e.style.transitionDuration=this._getCssProperty("--map-card-internal-transitions-duration"),this._getPinchZoom().setTransform({scale:1,x:0,y:0,allowChangeEvent:!0}),this.mapScale=1,be("selection"),Yo(300).then(()=>e.style.transitionDuration="0s")}_initializeRooms(){if(!this.connected)return;if(!this.modes||0===this.modes.length){if(this._initializeRoomsRetries>=20)return;return this._initializeRoomsRetries++,void Yo(500).then(()=>this._initializeRooms())}this._initializeRoomsRetries=0;const e=this.modes.find(e=>"vacuum_clean_segment"===e.config.template||e.selectionType===fo.ROOM);if(!e)return;if(e.predefinedSelections&&e.predefinedSelections.length>0)return this.selectableRooms=e.predefinedSelections.map(e=>new Dr(e,this._getContext())),void this.requestUpdate();const t=this._getRoomsConfig();t&&t.rooms.length>0&&(e.predefinedSelections&&0!==e.predefinedSelections.length||(e.predefinedSelections=t.rooms),this.selectableRooms=t.rooms.map(e=>new Dr(e,this._getContext())),this.requestUpdate())}_activateRoomMode(){let e=this.modes.findIndex(e=>"vacuum_clean_segment"===e.config.template);-1===e&&(e=this.modes.findIndex(e=>e.selectionType===fo.ROOM)),-1!==e&&(this._setCurrentMode(e,!0),be("selection"))}_getCssProperty(e){return getComputedStyle(this._getMapImage()).getPropertyValue(e)}_calculateBasicScale(){const e=this._getMapImage();e&&e.naturalWidth>0&&(this.realImageWidth=e.naturalWidth,this.realImageHeight=e.naturalHeight,this.realScale=e.width/e.naturalWidth)}_buildPickCanvas(){this._roomPickEngine.ensurePickCanvas()}_updateRoomSelectionOverlay(){const e=this.shadowRoot?.getElementById("room-selection-overlay");if(!e)return;"room"===this.activeTab&&this._buildPickCanvas();const t=this.shadowRoot?.getElementById("map-image");this._roomPickEngine.drawSelectionOverlay(e,t,this.selectedRooms,this.activeTab)}_hitTestRoom(e){if(0===this.selectableRooms.length)return null;this._buildPickCanvas();const t=this._getMapImage();if(!t)return null;const a=t.getBoundingClientRect(),i=(e.clientX-a.left)/a.width,n=(e.clientY-a.top)/a.height,o=this._roomPickEngine.hitTest(i,n);return void 0===o?null:this.selectableRooms.find(e=>String(e.toVacuum())===String(o))??null}_calculateScale(){const e=this._getPinchZoom();e&&(this.mapScale=e.scale,this.mapX=e.x,this.mapY=e.y)}_getPinchZoom(){return this.shadowRoot?.getElementById("map-zoomer")}_getMapImage(){return this.shadowRoot?.getElementById("map-image")}_getMapZoomerContent(){return this.shadowRoot?.getElementById("map-zoomer-content")}_getSvgWrapper(){return this.shadowRoot?.querySelector("#svg-wrapper")}_showConfigErrors(e){e.forEach(e=>console.error(e));const t=document.createElement("hui-error-card");try{return t.setConfig({type:"error",error:e[0],origConfig:this.config}),q` ${t} `}catch{return q` <pre style="padding: 10px; background-color: red;">${e[0]}</pre> `}}_showOldConfig(){return q`
            <hui-warning>
                <h1>Xiaomi Vacuum Map Card ${"v@VACUUM_MAP_CARD_VERSION_PLACEHOLDER@"}</h1>
                <p>${this._localize("common.old_configuration")}</p>
                <p>
                    <a href="https://github.com/foXaCe/dreame-vacuum-card#migrating-from-v1xx" target="_blank"
                        >${this._localize("common.old_configuration_migration_link")}</a
                    >
                </p>
            </hui-warning>
        `}_showInvalidEntities(e){return q`
            <hui-warning>
                <h1>${this._localize("validation.invalid_entities")}</h1>
                <ul>
                    ${e.map(e=>q` <li>
                                <pre>${e}</pre>
                            </li>`)}
                </ul>
            </hui-warning>
        `}_showInvalidCalibrationWarning(){return q` <hui-warning>${this._localize("validation.invalid_calibration")}</hui-warning> `}_localize(e){return vo(e,this.hass,this.config)}static get styles(){return as}};e([_e()],Ls.prototype,"oldConfig",void 0),e([_e()],Ls.prototype,"config",void 0),e([_e()],Ls.prototype,"presetIndex",void 0),e([_e()],Ls.prototype,"realScale",void 0),e([_e()],Ls.prototype,"realImageWidth",void 0),e([_e()],Ls.prototype,"realImageHeight",void 0),e([_e()],Ls.prototype,"mapScale",void 0),e([_e()],Ls.prototype,"mapX",void 0),e([_e()],Ls.prototype,"mapY",void 0),e([_e()],Ls.prototype,"repeats",void 0),e([_e()],Ls.prototype,"selectedMode",void 0),e([_e()],Ls.prototype,"activeTab",void 0),e([_e()],Ls.prototype,"mapLocked",void 0),e([_e()],Ls.prototype,"configErrors",void 0),e([_e()],Ls.prototype,"connected",void 0),e([_e()],Ls.prototype,"mapLoaded",void 0),e([_e()],Ls.prototype,"internalVariables",void 0),e([ge({attribute:!1})],Ls.prototype,"_hass",void 0),Ls=$s=e([ue(yo)],Ls);export{Gr as g};
