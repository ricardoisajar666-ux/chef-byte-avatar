import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

let scene,camera,renderer,controls,clock;
let avatar,faceGroup,eyeL,eyeR,mouthObj,cherryObj;
let products=[],displayCases=[];
let selectedProduct=null,promoMode=false,promoTimer=null,promoIndex=0;
let voiceOn=true,isTalking=false;
const S=window.speechSynthesis;
const EL_KEY='sk_112617f23620344b47cad6da36eaab66088582e8c18b7016';
const EL_VOICE='s91wgzodwL1wfwitqbIm';
const EL_MODEL='eleven_multilingual_v2';
const raycaster=new THREE.Raycaster();
const mouse=new THREE.Vector2();

const productData=[
    {id:'tarta',name:'Tarta de Fresa Celestial',price:'$35.000',desc:'Una exquisita tarta de fresa con crema batida fresca y una base crujiente. Decorada con fresas naturales y un toque de vainilla de Madagascar.',color:0xff6b8a,accent:0xffb6c1},
    {id:'cupcake',name:'Cupcake de Chocolate Divino',price:'$18.000',desc:'Un suave cupcake de chocolate con glaseado intenso y chispas de cacao belga. El favorito de nuestros clientes.',color:0x8b4513,accent:0xd2691e},
    {id:'macaron',name:'Macaron Arcoiris',price:'$12.000',desc:'Delicados macarons de colores variados, cada uno con un sabor unico. Textura crujiente por fuera, suave por dentro.',color:0xff69b4,accent:0xba55d3},
    {id:'donut',name:'Donut Glaseado Clasico',price:'$8.000',desc:'El clasico donut glaseado, suave y esponjoso, ideal para acompanar tu cafe favorito.',color:0xffa500,accent:0xffd700}
];

function initThree(){
    scene=new THREE.Scene();
    scene.background=new THREE.Color(0xf5e6d3);
    scene.fog=new THREE.Fog(0xf5e6d3,18,35);

    camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,0.1,100);
    camera.position.set(0,3.5,9);

    renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(innerWidth,innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.3;
    document.body.prepend(renderer.domElement);

    controls=new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;
    controls.dampingFactor=0.08;
    controls.enablePan=false;
    controls.minDistance=4;
    controls.maxDistance=14;
    controls.maxPolarAngle=Math.PI/2.1;
    controls.target.set(0,1.2,0);

    clock=new THREE.Clock();

    scene.add(new THREE.AmbientLight(0xfff0e0,0.8));

    const sun=new THREE.DirectionalLight(0xfff5e6,1.2);
    sun.position.set(4,8,5);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.near=0.5;
    sun.shadow.camera.far=25;
    sun.shadow.camera.left=-10;
    sun.shadow.camera.right=10;
    sun.shadow.camera.top=10;
    sun.shadow.camera.bottom=-10;
    sun.shadow.bias=-0.001;
    scene.add(sun);

    const fillL=new THREE.DirectionalLight(0xffe8d0,0.5);
    fillL.position.set(-5,4,3);
    scene.add(fillL);

    const rim=new THREE.DirectionalLight(0xffd4b8,0.4);
    rim.position.set(0,3,-5);
    scene.add(rim);

    const spotMain=new THREE.SpotLight(0xffffff,0.8,10,Math.PI/5,0.4);
    spotMain.position.set(0,6,2);
    spotMain.target.position.set(0,0.8,0);
    scene.add(spotMain);
    scene.add(spotMain.target);

    const plL=new THREE.PointLight(0xfff0e0,0.3,6);
    plL.position.set(-3,3,1);
    scene.add(plL);
    const plR=new THREE.PointLight(0xfff0e0,0.3,6);
    plR.position.set(3,3,1);
    scene.add(plR);
}

function createEnvironment(){
    const floorMat=new THREE.MeshStandardMaterial({color:0xdeb896,roughness:0.6,metalness:0.05});
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),floorMat);
    floor.rotation.x=-Math.PI/2;
    floor.position.y=-0.5;
    floor.receiveShadow=true;
    scene.add(floor);

    const tileMat=new THREE.MeshStandardMaterial({color:0xc9a882,roughness:0.8});
    for(let i=-10;i<11;i+=2){
        const line=new THREE.Mesh(new THREE.PlaneGeometry(0.02,20),tileMat);
        line.rotation.x=-Math.PI/2;
        line.position.set(i,-0.49,0);
        scene.add(line);
    }
    for(let i=-10;i<11;i+=2){
        const line=new THREE.Mesh(new THREE.PlaneGeometry(20,0.02),tileMat);
        line.rotation.x=-Math.PI/2;
        line.position.set(0,-0.49,i);
        scene.add(line);
    }

    const wallMat=new THREE.MeshStandardMaterial({color:0xf0dcc8,roughness:0.9});
    const backWall=new THREE.Mesh(new THREE.PlaneGeometry(16,7),wallMat);
    backWall.position.set(0,3,-5);
    backWall.receiveShadow=true;
    scene.add(backWall);

    const sideWallL=new THREE.Mesh(new THREE.PlaneGeometry(12,7),wallMat);
    sideWallL.position.set(-8,3,1);
    sideWallL.rotation.y=Math.PI/2;
    scene.add(sideWallL);

    const sideWallR=new THREE.Mesh(new THREE.PlaneGeometry(12,7),wallMat);
    sideWallR.position.set(8,3,1);
    sideWallR.rotation.y=-Math.PI/2;
    scene.add(sideWallR);

    const stripeMat=new THREE.MeshStandardMaterial({color:0xe8d0bc,roughness:0.85});
    for(let i=-7;i<8;i+=2){
        const stripe=new THREE.Mesh(new THREE.PlaneGeometry(0.1,7),stripeMat);
        stripe.position.set(i,3,-4.98);
        scene.add(stripe);
    }

    const moldingMat=new THREE.MeshStandardMaterial({color:0xe0c8b0,roughness:0.5});
    const topMold=new THREE.Mesh(new THREE.BoxGeometry(16,0.1,0.12),moldingMat);
    topMold.position.set(0,6.3,-4.94);
    scene.add(topMold);

    const shelfMat=new THREE.MeshStandardMaterial({color:0xc9a882,roughness:0.5,metalness:0.05});
    const shelf1=new THREE.Mesh(new THREE.BoxGeometry(6,0.06,0.3),shelfMat);
    shelf1.position.set(0,4,-4.85);
    scene.add(shelf1);

    const shelf2=new THREE.Mesh(new THREE.BoxGeometry(4,0.06,0.3),shelfMat);
    shelf2.position.set(0,2.5,-4.85);
    scene.add(shelf2);

    const vaseMat=new THREE.MeshStandardMaterial({color:0xe8c8a0,roughness:0.35,metalness:0.1});
    [-2,-0.7,0.7,2].forEach(x=>{
        const vase=new THREE.Group();
        const body=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.09,0.18,12),vaseMat);
        body.position.y=0.09;vase.add(body);
        const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.04,0.07,12),vaseMat);
        neck.position.y=0.21;vase.add(neck);
        const lip=new THREE.Mesh(new THREE.TorusGeometry(0.035,0.008,8,16),vaseMat);
        lip.position.y=0.24;lip.rotation.x=Math.PI/2;vase.add(lip);
        vase.position.set(x,4.03,-4.7);
        scene.add(vase);
    });

    const bookColors=[0xc0392b,0x2980b9,0x27ae60,0xf39c12];
    bookColors.forEach((c,i)=>{
        const book=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.18,0.06),new THREE.MeshStandardMaterial({color:c,roughness:0.6}));
        book.position.set(-0.8+i*0.55,2.59,-4.7);
        book.rotation.z=0.05*(i%2===0?1:-1);
        scene.add(book);
    });

    const lampCord=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.8,6),new THREE.MeshStandardMaterial({color:0x555555,roughness:0.4}));
    lampCord.position.set(0,6,0);scene.add(lampCord);
    const lampShade=new THREE.Mesh(new THREE.ConeGeometry(0.35,0.25,16,1,true),new THREE.MeshStandardMaterial({color:0xfff0e0,roughness:0.4,side:THREE.DoubleSide,transparent:true,opacity:0.8}));
    lampShade.position.set(0,5.55,0);lampShade.rotation.x=Math.PI;scene.add(lampShade);
    const lampLight=new THREE.PointLight(0xffeedd,0.5,10);
    lampLight.position.set(0,5.5,0);scene.add(lampLight);

    createDisplayCases();
}

function createDisplayCases(){
    const glassMat=new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:0.1,roughness:0.05,metalness:0.05,transmission:0.9,thickness:0.3});
    const frameMat=new THREE.MeshStandardMaterial({color:0xc9a882,roughness:0.35,metalness:0.15});

    const mainCase=createDisplayCase(glassMat,frameMat,2.6,1.2,1.5,true);
    mainCase.position.set(0,-0.1,0.5);
    scene.add(mainCase);
    displayCases.push(mainCase);

    const secPos=[{x:-3.2,z:1.5},{x:3.2,z:1.5}];
    secPos.forEach((pos,i)=>{
        const c=createDisplayCase(glassMat,frameMat,1.5,0.9,1.1,false);
        c.position.set(pos.x,-0.1,pos.z);
        scene.add(c);
        displayCases.push(c);
    });
}

function createDisplayCase(glassMat,frameMat,w,h,d,isMain){
    const g=new THREE.Group();

    const glass=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),glassMat);
    glass.position.y=h/2+0.05;
    g.add(glass);

    const fTop=new THREE.Mesh(new THREE.BoxGeometry(w+0.04,0.04,d+0.04),frameMat);
    fTop.position.y=h+0.05;g.add(fTop);
    const fBot=new THREE.Mesh(new THREE.BoxGeometry(w+0.04,0.04,d+0.04),frameMat);
    fBot.position.y=0.05;g.add(fBot);

    const eGeo=new THREE.BoxGeometry(0.04,h,0.04);
    [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].forEach(([x,z])=>{
        const e=new THREE.Mesh(eGeo,frameMat);
        e.position.set(x,h/2+0.05,z);g.add(e);
    });

    const inner=new THREE.PointLight(isMain?0xfff5e6:0xffeedd,isMain?0.5:0.25,3);
    inner.position.y=h;g.add(inner);

    if(isMain){
        const pedMat=new THREE.MeshStandardMaterial({color:0xb8956a,roughness:0.4,metalness:0.1});
        const ped=new THREE.Mesh(new THREE.BoxGeometry(w+0.08,0.12,d+0.08),pedMat);
        ped.position.y=0.01;g.add(ped);
    }

    return g;
}

function createProducts(){
    productData.forEach((data,i)=>{
        const product=createProductModel(data);
        product.userData={...data,index:i};

        if(i===0){
            const mc=displayCases[0];
            product.position.set(mc.position.x,0.75,mc.position.z);
        }else if(i===1){
            product.position.set(-3.2,0.65,1.5);
        }else if(i===2){
            product.position.set(3.2,0.65,1.5);
        }else{
            product.position.set(0,0.65,2.5);
        }

        product.castShadow=true;
        scene.add(product);
        products.push(product);
    });
}

function createProductModel(data){
    const g=new THREE.Group();
    const mat=new THREE.MeshStandardMaterial({color:data.color,roughness:0.3,metalness:0.1});
    const matA=new THREE.MeshStandardMaterial({color:data.accent,roughness:0.25,metalness:0.05});

    switch(data.id){
        case'tarta':{
            const b=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.45,0.1,32),mat);
            b.position.y=0.05;g.add(b);
            const c=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.4,0.07,32),matA);
            c.position.y=0.135;g.add(c);
            const m=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.38,0.08,32),new THREE.MeshStandardMaterial({color:0xff8a9a,roughness:0.3}));
            m.position.y=0.21;g.add(m);
            const ic=new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.35,0.05,32),new THREE.MeshStandardMaterial({color:0xffc0cb,roughness:0.2}));
            ic.position.y=0.275;g.add(ic);
            const s=new THREE.Mesh(new THREE.SphereGeometry(0.06,16,16),new THREE.MeshStandardMaterial({color:0xff2244,roughness:0.25}));
            s.position.y=0.35;g.add(s);
            break;
        }
        case'cupcake':{
            const cp=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.22,0.2,16),new THREE.MeshStandardMaterial({color:0xf5deb3,roughness:0.55}));
            cp.position.y=0.1;g.add(cp);
            const fr=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.25,16),mat);
            fr.position.y=0.33;g.add(fr);
            const ch=new THREE.Mesh(new THREE.SphereGeometry(0.035,12,12),new THREE.MeshStandardMaterial({color:0xff0000,roughness:0.2}));
            ch.position.y=0.48;g.add(ch);
            break;
        }
        case'macaron':{
            const sT=new THREE.Mesh(new THREE.SphereGeometry(0.16,24,12,0,Math.PI*2,0,Math.PI/2),mat);
            sT.position.y=0.18;sT.rotation.x=Math.PI;g.add(sT);
            const sB=new THREE.Mesh(new THREE.SphereGeometry(0.16,24,12,0,Math.PI*2,0,Math.PI/2),mat);
            sB.position.y=0.14;g.add(sB);
            const f=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.035,24),matA);
            f.position.y=0.16;g.add(f);
            break;
        }
        case'donut':{
            const d=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.075,16,32),mat);
            d.position.y=0.1;d.rotation.x=Math.PI/2;g.add(d);
            const gl=new THREE.Mesh(new THREE.TorusGeometry(0.17,0.06,16,32,Math.PI),matA);
            gl.position.y=0.12;gl.rotation.x=Math.PI/2;g.add(gl);
            const cols=[0xff0000,0x00ff00,0x0000ff,0xffff00,0xff00ff];
            for(let i=0;i<10;i++){
                const sp=new THREE.Mesh(new THREE.BoxGeometry(0.006,0.02,0.006),new THREE.MeshStandardMaterial({color:cols[i%5],roughness:0.3}));
                const a=(i/10)*Math.PI*2;
                sp.position.set(Math.cos(a)*0.17,0.16,Math.sin(a)*0.17);
                sp.rotation.set(Math.random(),Math.random(),Math.random());
                g.add(sp);
            }
            break;
        }
    }
    return g;
}

function createAvatar(){
    avatar=new THREE.Group();

    const matB=new THREE.MeshStandardMaterial({color:0xf5a623,roughness:0.35});
    const matM=new THREE.MeshStandardMaterial({color:0xffe8d0,roughness:0.3});
    const matT=new THREE.MeshStandardMaterial({color:0xff9ab0,roughness:0.25});
    const matC=new THREE.MeshStandardMaterial({color:0xe74c3c,roughness:0.2,metalness:0.15});
    const matA=new THREE.MeshStandardMaterial({color:0xffb0c0,roughness:0.35});

    const base=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.65,0.4,32),matB);
    base.position.y=0.2;base.castShadow=true;avatar.add(base);

    const drips=new THREE.MeshStandardMaterial({color:0xf5a623,roughness:0.3,metalness:0.05});
    for(let i=0;i<5;i++){
        const dr=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,8),drips);
        const a=(i/5)*Math.PI*2;
        dr.scale.y=1.5;dr.position.set(Math.cos(a)*0.61,0.3,Math.sin(a)*0.61);
        avatar.add(dr);
    }

    const mid=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.55,0.28,32),matM);
    mid.position.y=0.59;mid.castShadow=true;avatar.add(mid);

    const top=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.45,0.22,32),matT);
    top.position.y=0.85;top.castShadow=true;avatar.add(top);

    cherryObj=new THREE.Mesh(new THREE.SphereGeometry(0.08,16,16),matC);
    cherryObj.position.y=1.02;cherryObj.castShadow=true;avatar.add(cherryObj);

    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.1,6),new THREE.MeshStandardMaterial({color:0x2d5a1e,roughness:0.5}));
    stem.position.y=1.12;stem.rotation.z=0.2;avatar.add(stem);
    const cLeaf=new THREE.Mesh(new THREE.SphereGeometry(0.025,8,8),new THREE.MeshStandardMaterial({color:0x3a8a2a,roughness:0.4}));
    cLeaf.scale.set(0.4,1.2,0.8);cLeaf.position.set(0.035,1.14,0);cLeaf.rotation.z=-0.5;avatar.add(cLeaf);

    faceGroup=new THREE.Group();
    faceGroup.position.set(0,0.5,0.55);

    eyeL=createEye();eyeL.position.set(-0.14,0.07,0);faceGroup.add(eyeL);
    eyeR=createEye();eyeR.position.set(0.14,0.07,0);faceGroup.add(eyeR);

    const browMat=new THREE.MeshStandardMaterial({color:0x5a3a2a,roughness:0.5});
    const bL=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.012,0.008),browMat);
    bL.position.set(-0.14,0.17,0.035);bL.rotation.z=0.15;faceGroup.add(bL);
    const bR=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.012,0.008),browMat);
    bR.position.set(0.14,0.17,0.035);bR.rotation.z=-0.15;faceGroup.add(bR);

    const blushMat=new THREE.MeshStandardMaterial({color:0xff8888,roughness:0.6,transparent:true,opacity:0.35});
    const cL=new THREE.Mesh(new THREE.CircleGeometry(0.035,16),blushMat);
    cL.position.set(-0.22,-0.02,0.035);faceGroup.add(cL);
    const cR=new THREE.Mesh(new THREE.CircleGeometry(0.035,16),blushMat);
    cR.position.set(0.22,-0.02,0.035);faceGroup.add(cR);

    const nose=new THREE.Mesh(new THREE.SphereGeometry(0.02,12,12),new THREE.MeshStandardMaterial({color:0xffb0c0,roughness:0.3}));
    nose.position.set(0,-0.015,0.05);nose.scale.set(1,0.8,0.7);faceGroup.add(nose);

    mouthObj=new THREE.Mesh(new THREE.SphereGeometry(0.04,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xe74c3c,roughness:0.3}));
    mouthObj.rotation.x=Math.PI;mouthObj.position.set(0,-0.09,0.01);
    faceGroup.add(mouthObj);

    avatar.add(faceGroup);

    const armGeo=new THREE.CapsuleGeometry(0.035,0.2,8,12);
    const armL=new THREE.Mesh(armGeo,matA);armL.position.set(-0.7,0.5,0.1);armL.rotation.z=0.6;armL.name='armL';avatar.add(armL);
    const armR=new THREE.Mesh(armGeo,matA);armR.position.set(0.7,0.5,0.1);armR.rotation.z=-0.6;armR.name='armR';avatar.add(armR);

    const handMat=new THREE.MeshStandardMaterial({color:0xffc0cb,roughness:0.35});
    const hL=new THREE.Mesh(new THREE.SphereGeometry(0.04,12,12),handMat);
    hL.position.set(-0.88,0.38,0.1);hL.name='handL';avatar.add(hL);
    const hR=new THREE.Mesh(new THREE.SphereGeometry(0.04,12,12),handMat);
    hR.position.set(0.88,0.38,0.1);hR.name='handR';avatar.add(hR);

    avatar.position.set(0,0,-0.8);
    scene.add(avatar);
}

function createEye(){
    const g=new THREE.Group();
    const w=new THREE.Mesh(new THREE.SphereGeometry(0.06,16,16),new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.08}));
    w.scale.set(1,1.15,0.6);g.add(w);
    const iris=new THREE.Mesh(new THREE.CircleGeometry(0.032,16),new THREE.MeshStandardMaterial({color:0x4a3a2a,roughness:0.12}));
    iris.position.z=0.04;g.add(iris);
    const pup=new THREE.Mesh(new THREE.CircleGeometry(0.016,16),new THREE.MeshStandardMaterial({color:0x111111}));
    pup.position.z=0.044;g.add(pup);
    const r1=new THREE.Mesh(new THREE.CircleGeometry(0.007,8),new THREE.MeshBasicMaterial({color:0xffffff}));
    r1.position.set(-0.008,0.01,0.048);g.add(r1);
    const r2=new THREE.Mesh(new THREE.CircleGeometry(0.004,8),new THREE.MeshBasicMaterial({color:0xffffff}));
    r2.position.set(0.006,-0.004,0.048);g.add(r2);
    return g;
}

let breathPhase=0,blinkTimer=0,nextBlink=2+Math.random()*4,mouthPhase=0;

function animate(){
    requestAnimationFrame(animate);
    const dt=clock.getDelta();
    const t=clock.getElapsedTime();

    breathPhase+=dt*1.5;
    blinkTimer+=dt;

    if(avatar){
        avatar.position.y=-0.5+Math.sin(breathPhase)*0.012;
        avatar.rotation.z=Math.sin(breathPhase*0.7)*0.01;

        if(blinkTimer>nextBlink){
            blinkTimer=0;nextBlink=2+Math.random()*4;
            blink();
        }

        if(isTalking){
            mouthPhase+=dt*14;
            if(mouthObj){
                const s=0.5+Math.abs(Math.sin(mouthPhase))*0.7;
                mouthObj.scale.set(s,1+Math.sin(mouthPhase*1.3)*0.3,1);
            }
        }else{
            if(mouthObj)mouthObj.scale.set(1,1,1);
        }

        if(cherryObj)cherryObj.position.y=1.02+Math.sin(t*1.5)*0.01;

        const armL=avatar.getObjectByName('armL');
        const armR=avatar.getObjectByName('armR');
        if(armL)armL.rotation.z=0.6+Math.sin(t*0.8)*0.05;
        if(armR)armR.rotation.z=-0.6+Math.sin(t*0.8+1)*0.05;

        if(selectedProduct&&faceGroup){
            const tp=selectedProduct.position.clone();
            tp.y=faceGroup.getWorldPosition(new THREE.Vector3()).y;
            faceGroup.lookAt(tp);
        }else if(faceGroup){
            faceGroup.rotation.y+=(0-faceGroup.rotation.y)*0.05;
        }
    }

    products.forEach((p,i)=>{
        const ty=i===0?0.75:0.65;
        p.position.y+=(ty-p.position.y)*0.08;
        if(p===selectedProduct)p.rotation.y+=dt*0.5;
    });

    controls.update();
    renderer.render(scene,camera);
}

function blink(){
    if(!eyeL||!eyeR)return;
    let f=0;
    const a=()=>{
        f++;
        const s=f<=4?1-f/4:f<=8?(f-4)/4:1;
        eyeL.scale.y=Math.max(0.05,s);
        eyeR.scale.y=Math.max(0.05,s);
        if(f<8)requestAnimationFrame(a);
    };
    a();
}

function onMouseMove(e){
    mouse.x=(e.clientX/innerWidth)*2-1;
    mouse.y=-(e.clientY/innerHeight)*2+1;
    raycaster.setFromCamera(mouse,camera);
    const hits=raycaster.intersectObjects(products,true);
    document.body.style.cursor=hits.length>0?'pointer':'default';
}

function onClick(e){
    mouse.x=(e.clientX/innerWidth)*2-1;
    mouse.y=-(e.clientY/innerHeight)*2+1;
    raycaster.setFromCamera(mouse,camera);
    const hits=raycaster.intersectObjects(products,true);
    if(hits.length>0){
        let obj=hits[0].object;
        while(obj.parent&&!obj.userData.id)obj=obj.parent;
        if(obj.userData.id)selectProduct(obj);
    }
}

function selectProduct(product){
    selectedProduct=product;
    const d=product.userData;

    document.getElementById('infoName').textContent=d.name;
    document.getElementById('infoPrice').textContent=d.price;
    document.getElementById('infoDesc').textContent=d.desc;
    document.getElementById('infoPanel').classList.add('show');

    const mc=displayCases[0];
    const tp=mc.position.clone();tp.y=0.75;
    animateProductTo(product,tp);

    speak(d.name+'. '+d.desc+'. Precio: '+d.price+' pesos colombianos.');
}

function animateProductTo(product,target){
    const start=product.position.clone();
    const dur=900;const st=Date.now();
    (function anim(){
        const t=Math.min((Date.now()-st)/dur,1);
        const ease=1-Math.pow(1-t,3);
        product.position.lerpVectors(start,target,ease);
        if(t<1)requestAnimationFrame(anim);
    })();
}

async function speakEL(txt){
    document.getElementById('loading').classList.add('on');
    try{
        const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}`,{
            method:'POST',
            headers:{'Content-Type':'application/json','xi-api-key':EL_KEY},
            body:JSON.stringify({text:txt,model_id:EL_MODEL,voice_settings:{stability:0.5,similarity_boost:0.75}})
        });
        if(!r.ok)throw new Error(r.status);
        const blob=await r.blob();
        const url=URL.createObjectURL(blob);
        const audio=new Audio(url);
        document.getElementById('loading').classList.remove('on');
        audio.onplay=()=>{isTalking=true;showBubble(txt)};
        audio.onended=()=>{isTalking=false;hideBubble();URL.revokeObjectURL(url)};
        audio.onerror=()=>{document.getElementById('loading').classList.remove('on');speakFB(txt)};
        await audio.play();
    }catch(e){document.getElementById('loading').classList.remove('on');speakFB(txt)}
}

function speakFB(txt){
    if(!S){showBubble(txt);return}
    S.cancel();
    const u=new SpeechSynthesisUtterance(txt);
    u.lang='es-ES';u.rate=0.9;u.pitch=1.05;u.volume=1;
    const vs=S.getVoices();
    const p=['Microsoft Sabina','Microsoft Helena','Google espanol','Paulina','es-ES'];
    let v=null;for(const n of p){v=vs.find(x=>x.name.includes(n));if(v)break}
    if(!v)v=vs.find(x=>x.lang.startsWith('es'));
    if(v)u.voice=v;
    u.onstart=()=>{isTalking=true;showBubble(txt)};
    u.onend=()=>{isTalking=false;hideBubble()};
    S.speak(u);
}

function speak(txt){if(!voiceOn){showBubble(txt);return}if(EL_KEY&&EL_VOICE){speakEL(txt);return}speakFB(txt)}

function showBubble(t){document.getElementById('bubbleText').textContent=t;document.getElementById('bubble').classList.add('show')}
function hideBubble(){document.getElementById('bubble').classList.remove('show')}

window.togglePromo=function(){
    promoMode=!promoMode;
    document.getElementById('promoBtn').className=promoMode?'btn active':'btn';
    if(promoMode){promoIndex=0;showNextPromo();}
    else{clearTimeout(promoTimer);promoTimer=null;}
};

function showNextPromo(){
    if(!promoMode)return;
    const d=productData[promoIndex];
    selectProduct(products[promoIndex]);
    speak(d.name+'. '+d.price+' pesos colombianos.');
    promoIndex=(promoIndex+1)%productData.length;
    promoTimer=setTimeout(showNextPromo,10000);
}

window.toggleVoice=function(){
    voiceOn=!voiceOn;
    const b=document.getElementById('voiceBtn');
    b.className=voiceOn?'on':'';
    b.textContent=voiceOn?'Voz On':'Voz Off';
    if(!voiceOn){S&&S.cancel();isTalking=false;hideBubble()}
};

window.resetCamera=function(){
    controls.target.set(0,1.2,0);
    camera.position.set(0,3.5,9);
};

window.resetView=function(){
    selectedProduct=null;
    document.getElementById('infoPanel').classList.remove('show');
    products.forEach((p,i)=>{
        if(i===0){
            const mc=displayCases[0];
            animateProductTo(p,new THREE.Vector3(mc.position.x,0.75,mc.position.z));
        }else if(i===1){
            animateProductTo(p,new THREE.Vector3(-3.2,0.65,1.5));
        }else if(i===2){
            animateProductTo(p,new THREE.Vector3(3.2,0.65,1.5));
        }else{
            animateProductTo(p,new THREE.Vector3(0,0.65,2.5));
        }
    });
    if(faceGroup)faceGroup.rotation.y=0;
};

window.greet=function(){speak('Hola! Bienvenido a nuestra tienda de postres. Selecciona un producto para conocerlo.')};

document.getElementById('startBtn').onclick=()=>{
    document.getElementById('splash').classList.add('hide');
    setTimeout(()=>{
        document.getElementById('splash').remove();
        speak('Bienvenido a Chef Byte! Esta es nuestra tienda de postres 3D. Selecciona cualquier postre de la vitrina para conocerlo.');
    },700);
};

initThree();
createEnvironment();
createProducts();
createAvatar();

renderer.domElement.addEventListener('mousemove',onMouseMove);
renderer.domElement.addEventListener('click',onClick);
animate();

window.addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
});
