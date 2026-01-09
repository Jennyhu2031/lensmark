import json
import cv2
import numpy as np
import os

def test_outputs():
    image_path = "person.png"
    mask_path = "mask.json"
    matte_path = "person_matte.png"
    
    print("--- Starting Verification ---")
    
    # 1. Check if original image exists
    if not os.path.exists(image_path):
        print(f"❌ Error: Original image {image_path} not found.")
        return
    img = cv2.imread(image_path)
    h, w = img.shape[:2]
    print(f"✅ Original image loaded: {w}x{h}")

    # 2. Check mask.json
    if not os.path.exists(mask_path):
        print(f"❌ Error: {mask_path} not found.")
    else:
        try:
            with open(mask_path, 'r') as f:
                mask_data = json.load(f)
            mask_np = np.array(mask_data)
            mh, mw = mask_np.shape
            if mh == h and mw == w:
                unique_vals = np.unique(mask_np)
                print(f"✅ mask.json verified: {mw}x{mh}, values: {unique_vals}")
            else:
                print(f"❌ Error: mask.json dimensions ({mw}x{mh}) do not match image ({w}x{h})")
        except Exception as e:
            print(f"❌ Error loading mask.json: {e}")

    # 3. Check person_matte.png
    if not os.path.exists(matte_path):
        print(f"❌ Error: {matte_path} not found.")
    else:
        matte_img = cv2.imread(matte_path)
        if matte_img is not None:
            mh, mw = matte_img.shape[:2]
            if mh == h and mw == w:
                print(f"✅ person_matte.png verified: {mw}x{mh}")
            else:
                print(f"❌ Error: person_matte.png dimensions ({mw}x{mh}) do not match image ({w}x{h})")
        else:
            print(f"❌ Error: Could not decode person_matte.png")

    print("--- Verification Finished ---")

if __name__ == "__main__":
    test_outputs()
