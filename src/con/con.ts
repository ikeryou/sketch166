import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Param } from '../core/param';
import { Conf } from '../core/conf';
import { Color } from "three/src/math/Color";
import { Item } from './item';
import { Util } from '../libs/util';
import { BoxGeometry } from "three/src/geometries/BoxGeometry";


export class Con extends Canvas {

  private _con: Object3D;
  private _itemTop:Array<Array<Item>> = []
  private _itemBottom:Array<Item> = []
  private _colors:Array<Color> = []
  private _heightEl:any

  constructor(opt: any) {
    super(opt);

    this._makeColors()
    this._makeColors()

    this._heightEl = document.querySelector('.js-height')

    this._con = new Object3D()
    this.mainScene.add(this._con)

    this._con.rotation.x = Util.instance.radian(45)
    this._con.rotation.y = Util.instance.radian(-45)

    const topNum = Conf.instance.TOP_ITEM_LINE * Conf.instance.TOP_ITEM_LINE
    let topIdList = [...Array(topNum)].map((_:undefined, idx:number) => idx)
    Util.instance.shuffle(topIdList)



    const geo = new BoxGeometry(1, 1, 1)
    const num = Conf.instance.ITEM_NUM
    for(let i = 0; i < num; i++) {
      // 下に配置
      const bottom = new Item({
          geo:geo,
          col:this._colors,
          id:i,
          isBottom:true,
      })
      this._con.add(bottom)
      this._itemBottom.push(bottom)

      // 上に配置
      let tops = []


      let topId = 0
      for(let l = 0; l < topNum; l++) {
        const ix = (l % Conf.instance.TOP_ITEM_LINE)
        const iy = ~~(l / Conf.instance.TOP_ITEM_LINE)
        const top = new Item({
          geo:geo,
          col:this._colors,
          id:i,
          isBottom:false,
          topId:topIdList[topId++],
          topId2:topId,
          topIX:ix,
          topIY:iy
        })
        this._con.add(top)
        tops.push(top)
      }
      this._itemTop.push(tops)
    }

    this._resize()
  }


  protected _update(): void {
    super._update()

    const h = this.renderSize.height

    // スクロールするサイズはこっちで指定
    this.css(this._heightEl, {
      height:(h * Conf.instance.SCROLL_HEIGHT) + 'px'
    })

    const itemH = this._itemBottom[0].itemSize.y
    const total = this._itemBottom.length * itemH
    this._itemBottom.forEach((val,i) => {
        val.position.y = itemH * i - total * 0.5
        this._itemTop[i].forEach((val2) => {
          val2.position.y = val.position.y
        })
    })

    this._con.position.y = Func.instance.screenOffsetY() * -1

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(Param.instance.main.bgColor.value, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    if(Conf.instance.IS_SP || Conf.instance.IS_TAB) {
      if(w == this.renderSize.width && this.renderSize.height * 2 > h) {
        return
      }
    }

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }


  // ------------------------------------
  // 使用カラー作成
  // ------------------------------------
  private _makeColors():void {
    // this._colors = []

    const colA = new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1))
    const colB = new Color(1 - colA.r, 1 - colA.g, 1 - colA.b)

    const hslA = { h: 0, s: 0, l: 0 }
    colA.getHSL(hslA)

    const hslB = { h: 0, s: 0, l: 0 }
    colB.getHSL(hslB)

    const r = 0.2
    for(let i = 0; i < 1; i++) {
      const hslA = { h: 0, s: 0, l: 0 }
      colA.getHSL(hslA)
      hslA.s += Util.instance.range(r)
      hslA.l += Util.instance.range(r)

      const hslB = { h: 0, s: 0, l: 0 }
      colB.getHSL(hslB)
      hslB.s += Util.instance.range(r)
      hslB.l += Util.instance.range(r)

      const colC = new Color()
      colC.setHSL(hslA.h, hslA.s, hslA.l)
      this._colors.push(colC)

      const colD = new Color()
      colD.setHSL(hslB.h, hslB.s, hslB.l)
      this._colors.push(colD)
    }
  }
}
