import vs from '../glsl/simple.vert';
import fs from '../glsl/item.frag';
import { MyObject3D } from "../webgl/myObject3D";
import { Util } from "../libs/util";
import { Mesh } from 'three/src/objects/Mesh';
import { FrontSide } from 'three/src/constants';
import { Func } from "../core/func";
import { Vector3 } from "three/src/math/Vector3";
import { Vector2 } from "three/src/math/Vector2";
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Color } from 'three/src/math/Color';
import { Object3D } from "three/src/core/Object3D";
import { Conf } from "../core/conf";
import { Scroller } from "../core/scroller";

export class Item extends MyObject3D {

  private _mesh:Array<Object3D> = []
  private _id:number
  private _isBottom:boolean
  private _isTop:boolean
  private _bomNoise:Array<Vector3> = []
  private _topId:number
  private _topKeys:Vector2 = new Vector2()

  public itemSize:Vector3 = new Vector3()

  constructor(opt:any = {}) {
    super()

    this._id = opt.id
    this._isBottom = opt.isBottom
    this._isTop = !opt.isBottom
    this._topId = opt.topId || 0

    if(this._isTop) {
      this._topKeys.x = opt.topIX
      this._topKeys.y = opt.topIY
    }

    const geo = opt.geo
    let col
    if(this._isTop) {
      col = ~~(this._id / 8) % 2 == 0 ? opt.col[this._topKeys.y % 2 == 0 ? 2 : 3] : opt.col[this._topKeys.y % 2 == 0 ? 3 : 2]
    } else {
      col = ~~(this._id / 8) % 2 == 0 ? opt.col[0] : opt.col[1]
    }

    let num = this._isBottom ? 4 : 1
    for(let i = 0; i < num; i++) {
      const m = new Mesh(
        geo,
        new ShaderMaterial({
          vertexShader:vs,
          fragmentShader:fs,
          transparent:true,
          side:FrontSide,
          uniforms:{
            alpha:{value:1},
            color:{value:new Color(col)},
            addColRate:{value:this._isBottom ? 0 : 0},
            addCol:{value:new Color(Util.instance.randomArr(opt.col))},
          }
        })
      )
      this.add(m)
      this._mesh.push(m)

      this._bomNoise.push(new Vector3(Util.instance.range(1), Util.instance.range(1), Util.instance.range(1)))
    }
    this.visible = false
  }


  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update()

    const sw = Func.instance.sw()
    const sh = Func.instance.sh()
    const baseSize = Func.instance.val(sw, sw * 0.4)
    const s = Scroller.instance.val.y
    const topNum = Conf.instance.TOP_ITEM_LINE * Conf.instance.TOP_ITEM_LINE
    let sr = (s) / (sh * Conf.instance.SCROLL_HEIGHT - sh * 2)

    let c = Util.instance.map(this._id, 0.0001, 1, 0, Conf.instance.ITEM_NUM - 1)
    let test = (sr >= c) && (sr <= c + 0.2)
    if(this._isTop) {
      // だんだんFIXするように
      sr = (s) / (sh * Util.instance.map(this._topId, 2, Conf.instance.SCROLL_HEIGHT, 0, topNum - 1) - sh)
      c = Util.instance.map(this._id, 0.7999, 0.1, 0, Conf.instance.ITEM_NUM - 1)
      test = (sr >= c) && (sr <= c + 0.2)
    }
    this.visible = test

    // 基本サイズ
    this.itemSize.x = baseSize * 0.5
    this.itemSize.y = (sh * 0.8) / Conf.instance.ITEM_NUM

    // 真ん中の
    const centerSize = this.itemSize.x * 0.75
    let w = (this.itemSize.x - centerSize) * 0.5
    let h = this.itemSize.y

    if(this._isBottom) {
      this._mesh[0].scale.set(w, h, this.itemSize.x)
      this._mesh[0].position.x = this.itemSize.x * -0.5 + w * 0.5
      this._mesh[0].position.y = 0
      this._mesh[0].position.z = 0

      this._mesh[1].scale.set(this.itemSize.x, h, w)
      this._mesh[1].position.z = this.itemSize.x * -0.5 + w * 0.5
      this._mesh[1].position.x = 0
      this._mesh[1].position.y = 0

      this._mesh[2].scale.set(w, h, this.itemSize.x)
      this._mesh[2].position.x = this.itemSize.x * 0.5 - w * 0.5
      this._mesh[2].position.y = 0
      this._mesh[2].position.z = 0

      this._mesh[3].scale.set(this.itemSize.x, h, w)
      this._mesh[3].position.z = this.itemSize.x * 0.5 - w * 0.5
      this._mesh[3].position.x = 0
      this._mesh[3].position.y = 0
    } else {
      this._mesh.forEach((val) => {
        const topBlockSize = (centerSize / Conf.instance.TOP_ITEM_LINE)
        const offsetX = topBlockSize * 0.5 - (topBlockSize * Conf.instance.TOP_ITEM_LINE) * 0.5
        val.position.x = topBlockSize * this._topKeys.x + offsetX
        val.position.z = topBlockSize * this._topKeys.y + offsetX

        val.scale.set(topBlockSize, h, topBlockSize)
      })
    }
  }
}