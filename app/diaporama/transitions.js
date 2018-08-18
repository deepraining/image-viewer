export default [
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from;uniform sampler2D to;uniform float progress;uniform vec2 resolution;uniform vec2 direction;uniform float smoothness;const vec2 center=vec2(0.5,0.5);void main(){vec2 p=gl_FragCoord.xy/resolution.xy;vec2 v=normalize(direction);v/=abs(v.x)+abs(v.y);float d=v.x*center.x+v.y*center.y;float m=smoothstep(-smoothness,0.0,v.x*p.x+v.y*p.y-(d-0.5+progress*(1.+smoothness)));gl_FragColor=mix(texture2D(to,p),texture2D(from,p),m);}',
    uniforms: {
      direction: [1, -1],
      smoothness: 0.5
    },
    name: 'directionalwipe'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\n\n#define \tM_PI   3.14159265358979323846\t/* pi */\nuniform sampler2D from;uniform sampler2D to;uniform float progress;uniform vec2 resolution;uniform float smoothness;const vec2 center=vec2(0.5,0.5);float quadraticInOut(float t){float p=2.0*t*t;return t<0.5?p:-p+(4.0*t)-1.0;}float linearInterp(vec2 range,vec2 domain,float x){return mix(range.x,range.y,smoothstep(domain.x,domain.y,clamp(x,domain.x,domain.y)));}float getGradient(float r,float dist){float grad=smoothstep(-smoothness,0.0,r-dist*(1.0+smoothness));if(r-dist<0.005&&r-dist>-0.005){return -1.0;}else if(r-dist<0.01&&r-dist>-0.005){return -2.0;}return grad;}float round(float a){return floor(a+0.5);}float getWave(vec2 p){vec2 _p=p-center;float rads=atan(_p.y,_p.x);float degs=degrees(rads)+180.0;vec2 range=vec2(0.0,M_PI*30.0);vec2 domain=vec2(0.0,360.0);float ratio=(M_PI*30.0)/360.0;degs=degs*ratio;float x=progress;float magnitude=mix(0.02,0.09,smoothstep(0.0,1.0,x));float offset=mix(40.0,30.0,smoothstep(0.0,1.0,x));float ease_degs=quadraticInOut(sin(degs));float deg_wave_pos=(ease_degs*magnitude)*sin(x*offset);return x+deg_wave_pos;}void main(){vec2 p=gl_FragCoord.xy/resolution.xy;if(progress==0.0){gl_FragColor=texture2D(from,p);}else if(progress==1.0){gl_FragColor=texture2D(to,p);}else{float dist=distance(center,p);float m=getGradient(getWave(p),dist);if(m==-2.0){gl_FragColor=mix(texture2D(from,p),vec4(0.0,0.0,0.0,1.0),0.75);}else{gl_FragColor=mix(texture2D(from,p),texture2D(to,p),m);}}}',
    uniforms: {
      smoothness: 0.02
    },
    name: 'undulating burn out'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from,to;uniform float progress;uniform vec2 resolution;uniform float strength;const float PI=3.141592653589793;float Linear_ease(in float begin,in float change,in float duration,in float time){return change*time/duration+begin;}float Exponential_easeInOut(in float begin,in float change,in float duration,in float time){if(time==0.0) return begin;else if(time==duration) return begin+change;time=time/(duration/2.0);if(time<1.0) return change/2.0*pow(2.0,10.0*(time-1.0))+begin;return change/2.0*(-pow(2.0,-10.0*(time-1.0))+2.0)+begin;}float Sinusoidal_easeInOut(in float begin,in float change,in float duration,in float time){return -change/2.0*(cos(PI*time/duration)-1.0)+begin;}float random(in vec3 scale,in float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}vec3 crossFade(in vec2 uv,in float dissolve){return mix(texture2D(from,uv).rgb,texture2D(to,uv).rgb,dissolve);}void main(){vec2 texCoord=gl_FragCoord.xy/resolution.xy;vec2 center=vec2(Linear_ease(0.25,0.5,1.0,progress),0.5);float dissolve=Exponential_easeInOut(0.0,1.0,1.0,progress);float strength=Sinusoidal_easeInOut(0.0,strength,0.5,progress);vec3 color=vec3(0.0);float total=0.0;vec2 toCenter=center-texCoord;float offset=random(vec3(12.9898,78.233,151.7182),0.0);for(float t=0.0;t<=40.0;t++){float percent=(t+offset)/40.0;float weight=4.0*(percent-percent*percent);color+=crossFade(texCoord+toCenter*percent*strength,dissolve)*weight;total+=weight;}gl_FragColor=vec4(color/total,1.0);}',
    uniforms: {
      strength: 0.4
    },
    name: 'CrossZoom'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from,to;uniform float progress;uniform vec2 resolution;const float MIN_AMOUNT=-0.16;const float MAX_AMOUNT=1.3;float amount=progress*(MAX_AMOUNT-MIN_AMOUNT)+MIN_AMOUNT;const float PI=3.141592653589793;const float scale=512.0;const float sharpness=3.0;float cylinderCenter=amount;float cylinderAngle=2.0*PI*amount;const float cylinderRadius=1.0/PI/2.0;vec3 hitPoint(float hitAngle,float yc,vec3 point,mat3 rrotation){float hitPoint=hitAngle/(2.0*PI);point.y=hitPoint;return rrotation*point;}vec4 antiAlias(vec4 color1,vec4 color2,float distanc){distanc*=scale;if(distanc<0.0) return color2;if(distanc>2.0) return color1;float dd=pow(1.0-distanc/2.0,sharpness);return ((color2-color1)*dd)+color1;}float distanceToEdge(vec3 point){float dx=abs(point.x>0.5?1.0-point.x:point.x);float dy=abs(point.y>0.5?1.0-point.y:point.y);if(point.x<0.0) dx=-point.x;if(point.x>1.0) dx=point.x-1.0;if(point.y<0.0) dy=-point.y;if(point.y>1.0) dy=point.y-1.0;if((point.x<0.0||point.x>1.0)&&(point.y<0.0||point.y>1.0)) return sqrt(dx*dx+dy*dy);return min(dx,dy);}vec4 seeThrough(float yc,vec2 p,mat3 rotation,mat3 rrotation){float hitAngle=PI-(acos(yc/cylinderRadius)-cylinderAngle);vec3 point=hitPoint(hitAngle,yc,rotation*vec3(p,1.0),rrotation);if(yc<=0.0&&(point.x<0.0||point.y<0.0||point.x>1.0||point.y>1.0)){vec2 texCoord=gl_FragCoord.xy/resolution.xy;return texture2D(to,texCoord);}if(yc>0.0) return texture2D(from,p);vec4 color=texture2D(from,point.xy);vec4 tcolor=vec4(0.0);return antiAlias(color,tcolor,distanceToEdge(point));}vec4 seeThroughWithShadow(float yc,vec2 p,vec3 point,mat3 rotation,mat3 rrotation){float shadow=distanceToEdge(point)*30.0;shadow=(1.0-shadow)/3.0;if(shadow<0.0) shadow=0.0;else shadow*=amount;vec4 shadowColor=seeThrough(yc,p,rotation,rrotation);shadowColor.r-=shadow;shadowColor.g-=shadow;shadowColor.b-=shadow;return shadowColor;}vec4 backside(float yc,vec3 point){vec4 color=texture2D(from,point.xy);float gray=(color.r+color.b+color.g)/15.0;gray+=(8.0/10.0)*(pow(1.0-abs(yc/cylinderRadius),2.0/10.0)/2.0+(5.0/10.0));color.rgb=vec3(gray);return color;}vec4 behindSurface(float yc,vec3 point,mat3 rrotation){float shado=(1.0-((-cylinderRadius-yc)/amount*7.0))/6.0;shado*=1.0-abs(point.x-0.5);yc=(-cylinderRadius-cylinderRadius-yc);float hitAngle=(acos(yc/cylinderRadius)+cylinderAngle)-PI;point=hitPoint(hitAngle,yc,point,rrotation);if(yc<0.0&&point.x>=0.0&&point.y>=0.0&&point.x<=1.0&&point.y<=1.0&&(hitAngle<PI||amount>0.5)){shado=1.0-(sqrt(pow(point.x-0.5,2.0)+pow(point.y-0.5,2.0))/(71.0/100.0));shado*=pow(-yc/cylinderRadius,3.0);shado*=0.5;}else{shado=0.0;}vec2 texCoord=gl_FragCoord.xy/resolution.xy;return vec4(texture2D(to,texCoord).rgb-shado,1.0);}void main(){vec2 texCoord=gl_FragCoord.xy/resolution.xy;const float angle=30.0*PI/180.0;float c=cos(-angle);float s=sin(-angle);mat3 rotation=mat3(c,s,0,-s,c,0,0.12,0.258,1);c=cos(angle);s=sin(angle);mat3 rrotation=mat3(c,s,0,-s,c,0,0.15,-0.5,1);vec3 point=rotation*vec3(texCoord,1.0);float yc=point.y-cylinderCenter;if(yc<-cylinderRadius){gl_FragColor=behindSurface(yc,point,rrotation);return;}if(yc>cylinderRadius){gl_FragColor=texture2D(from,texCoord);return;}float hitAngle=(acos(yc/cylinderRadius)+cylinderAngle)-PI;float hitAngleMod=mod(hitAngle,2.0*PI);if((hitAngleMod>PI&&amount<0.5)||(hitAngleMod>PI/2.0&&amount<0.0)){gl_FragColor=seeThrough(yc,texCoord,rotation,rrotation);return;}point=hitPoint(hitAngle,yc,point,rrotation);if(point.x<0.0||point.y<0.0||point.x>1.0||point.y>1.0){gl_FragColor=seeThroughWithShadow(yc,texCoord,point,rotation,rrotation);return;}vec4 color=backside(yc,point);vec4 otherColor;if(yc<0.0){float shado=1.0-(sqrt(pow(point.x-0.5,2.0)+pow(point.y-0.5,2.0))/0.71);shado*=pow(-yc/cylinderRadius,3.0);shado*=0.5;otherColor=vec4(0.0,0.0,0.0,shado);}else{otherColor=texture2D(from,texCoord);}color=antiAlias(color,otherColor,cylinderRadius-abs(yc));vec4 cl=seeThroughWithShadow(yc,texCoord,point,rotation,rrotation);float dist=distanceToEdge(point);gl_FragColor=antiAlias(color,cl,dist);}',
    uniforms: {},
    name: 'PageCurl'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from,to;uniform float progress;uniform vec2 resolution;void main(void){vec2 p=gl_FragCoord.xy/resolution.xy;float T=progress;float S0=1.0;float S1=50.0;float S2=1.0;float Half=0.5;float PixelSize=(T<Half)?mix(S0,S1,T/Half):mix(S1,S2,(T-Half)/Half);vec2 D=PixelSize/resolution.xy;vec2 UV=(p+vec2(-0.5))/D;vec2 Coord=clamp(D*(ceil(UV+vec2(-0.5)))+vec2(0.5),vec2(0.0),vec2(1.0));vec4 C0=texture2D(from,Coord);vec4 C1=texture2D(to,Coord);gl_FragColor=mix(C0,C1,T);}',
    uniforms: {},
    name: 'AdvancedMosaic'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from,to;uniform float progress;uniform vec2 resolution;void glitch_memories(sampler2D pic){vec2 p=gl_FragCoord.xy/resolution.xy;vec2 block=floor(gl_FragCoord.xy/vec2(16));vec2 uv_noise=block/vec2(64);uv_noise+=floor(vec2(progress)*vec2(1200.0,3500.0))/vec2(64);float block_thresh=pow(fract(progress*1200.0),2.0)*0.2;float line_thresh=pow(fract(progress*2200.0),3.0)*0.7;vec2 red=p,green=p,blue=p,o=p;vec2 dist=(fract(uv_noise)-0.5)*0.3;red+=dist*0.1;green+=dist*0.2;blue+=dist*0.125;gl_FragColor.r=texture2D(pic,red).r;gl_FragColor.g=texture2D(pic,green).g;gl_FragColor.b=texture2D(pic,blue).b;gl_FragColor.a=1.0;}void main(void){float smoothed=smoothstep(0.,1.,progress);if((smoothed<0.4&&smoothed>0.1)){glitch_memories(from);}else if((smoothed>0.6&&smoothed<0.9)){glitch_memories(to);}else{vec2 p=gl_FragCoord.xy/resolution.xy;gl_FragColor=mix(texture2D(from,p),texture2D(to,p),progress);}}',
    uniforms: {},
    name: 'Glitch Memories'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from;uniform sampler2D to;uniform float progress;uniform vec2 resolution;uniform float reflection;uniform float perspective;uniform float depth;const vec4 black=vec4(0.0,0.0,0.0,1.0);const vec2 boundMin=vec2(0.0,0.0);const vec2 boundMax=vec2(1.0,1.0);bool inBounds(vec2 p){return all(lessThan(boundMin,p))&&all(lessThan(p,boundMax));}vec2 project(vec2 p){return p*vec2(1.0,-1.2)+vec2(0.0,-0.02);}vec4 bgColor(vec2 p,vec2 pto){vec4 c=black;pto=project(pto);if(inBounds(pto)){c+=mix(black,texture2D(to,pto),reflection*mix(1.0,0.0,pto.y));}return c;}void main(){vec2 p=gl_FragCoord.xy/resolution.xy;vec2 pfr=vec2(-1.),pto=vec2(-1.);float middleSlit=2.0*abs(p.x-0.5)-progress;if(middleSlit>0.0){pfr=p+(p.x>0.5?-1.0:1.0)*vec2(0.5*progress,0.0);float d=1.0/(1.0+perspective*progress*(1.0-middleSlit));pfr.y-=d/2.;pfr.y*=d;pfr.y+=d/2.;}float size=mix(1.0,depth,1.-progress);pto=(p+vec2(-0.5,-0.5))*vec2(size,size)+vec2(0.5,0.5);if(inBounds(pfr)){gl_FragColor=texture2D(from,pfr);}else if(inBounds(pto)){gl_FragColor=texture2D(to,pto);}else{gl_FragColor=bgColor(p,pto);}}',
    uniforms: {
      reflection: 0.4,
      perspective: 0.4,
      depth: 3
    },
    name: 'doorway'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from;uniform sampler2D to;uniform float progress;uniform vec2 resolution;uniform float reflection;uniform float perspective;uniform float depth;const vec4 black=vec4(0.0,0.0,0.0,1.0);const vec2 boundMin=vec2(0.0,0.0);const vec2 boundMax=vec2(1.0,1.0);bool inBounds(vec2 p){return all(lessThan(boundMin,p))&&all(lessThan(p,boundMax));}vec2 project(vec2 p){return p*vec2(1.0,-1.2)+vec2(0.0,-0.02);}vec4 bgColor(vec2 p,vec2 pfr,vec2 pto){vec4 c=black;pfr=project(pfr);if(inBounds(pfr)){c+=mix(black,texture2D(from,pfr),reflection*mix(1.0,0.0,pfr.y));}pto=project(pto);if(inBounds(pto)){c+=mix(black,texture2D(to,pto),reflection*mix(1.0,0.0,pto.y));}return c;}void main(){vec2 p=gl_FragCoord.xy/resolution.xy;vec2 pfr,pto=vec2(-1.);float size=mix(1.0,depth,progress);float persp=perspective*progress;pfr=(p+vec2(-0.0,-0.5))*vec2(size/(1.0-perspective*progress),size/(1.0-size*persp*p.x))+vec2(0.0,0.5);size=mix(1.0,depth,1.-progress);persp=perspective*(1.-progress);pto=(p+vec2(-1.0,-0.5))*vec2(size/(1.0-perspective*(1.0-progress)),size/(1.0-size*persp*(0.5-p.x)))+vec2(1.0,0.5);bool fromOver=progress<0.5;if(fromOver){if(inBounds(pfr)){gl_FragColor=texture2D(from,pfr);}else if(inBounds(pto)){gl_FragColor=texture2D(to,pto);}else{gl_FragColor=bgColor(p,pfr,pto);}}else{if(inBounds(pto)){gl_FragColor=texture2D(to,pto);}else if(inBounds(pfr)){gl_FragColor=texture2D(from,pfr);}else{gl_FragColor=bgColor(p,pfr,pto);}}}',
    uniforms: {
      reflection: 0.4,
      perspective: 0.2,
      depth: 3
    },
    name: 'swap'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from,to;uniform float progress;uniform vec2 resolution;uniform float persp;uniform float unzoom;uniform float reflection;uniform float floating;vec2 project(vec2 p){return p*vec2(1.0,-1.2)+vec2(0.0,-floating/100.);}bool inBounds(vec2 p){return all(lessThan(vec2(0.0),p))&&all(lessThan(p,vec2(1.0)));}vec4 bgColor(vec2 p,vec2 pfr,vec2 pto){vec4 c=vec4(0.0,0.0,0.0,1.0);pfr=project(pfr);if(inBounds(pfr)){c+=mix(vec4(0.0),texture2D(from,pfr),reflection*mix(1.0,0.0,pfr.y));}pto=project(pto);if(inBounds(pto)){c+=mix(vec4(0.0),texture2D(to,pto),reflection*mix(1.0,0.0,pto.y));}return c;}vec2 xskew(vec2 p,float persp,float center){float x=mix(p.x,1.0-p.x,center);return ((vec2(x,(p.y-0.5*(1.0-persp)*x)/(1.0+(persp-1.0)*x))-vec2(0.5-distance(center,0.5),0.0))*vec2(0.5/distance(center,0.5)*(center<0.5?1.0:-1.0),1.0)+vec2(center<0.5?0.0:1.0,0.0));}void main(){vec2 op=gl_FragCoord.xy/resolution.xy;float uz=unzoom*2.0*(0.5-distance(0.5,progress));vec2 p=-uz*0.5+(1.0+uz)*op;vec2 fromP=xskew((p-vec2(progress,0.0))/vec2(1.0-progress,1.0),1.0-mix(progress,0.0,persp),0.0);vec2 toP=xskew(p/vec2(progress,1.0),mix(pow(progress,2.0),1.0,persp),1.0);if(inBounds(fromP)){gl_FragColor=texture2D(from,fromP);}else if(inBounds(toP)){gl_FragColor=texture2D(to,toP);}else{gl_FragColor=bgColor(op,fromP,toP);}}',
    uniforms: {
      persp: 0.7,
      unzoom: 0.3,
      reflection: 0.4,
      floating: 3
    },
    name: 'cube'
  },
  {
    glsl:
      '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from;uniform sampler2D to;uniform float progress;uniform vec2 resolution;uniform float amplitude;uniform float speed;void main(){vec2 p=gl_FragCoord.xy/resolution.xy;vec2 dir=p-vec2(.5);float dist=length(dir);vec2 offset=dir*(sin(progress*dist*amplitude-progress*speed)+.5)/30.;gl_FragColor=mix(texture2D(from,p+offset),texture2D(to,p),smoothstep(0.2,1.0,progress));}',
    uniforms: {
      amplitude: 100,
      speed: 50
    },
    name: 'ripple'
  }
];
