import * as THREE from "three";
import { type OilArtMaterialRef } from "../oilart/OilArtPlane";

declare module "@react-three/fiber" {
  interface ThreeElements {
    oilArtMaterial: Partial<OilArtMaterialRef> & {
      ref?: React.Ref<OilArtMaterialRef>;
    };
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      oilArtMaterial: Partial<OilArtMaterialRef> & {
        ref?: React.Ref<OilArtMaterialRef>;
      };
    }
  }
}
