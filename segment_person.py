import cv2
import numpy as np
import json
import os
from ultralytics import YOLO

def segment_person(image_path, output_json, output_image):
    # Load YOLOv8-seg model (using nano for speed)
    model = YOLO('yolov8n-seg.pt')
    
    # Run inference
    results = model(image_path)
    
    # Original image
    img = cv2.imread(image_path)
    h, w, _ = img.shape
    
    # Find the largest person detected
    person_mask = None
    max_area = 0
    
    for result in results:
        if result.masks is not None:
            for i, mask in enumerate(result.masks.data):
                cls = int(result.boxes.cls[i])
                # Class 0 is 'person' in COCO dataset
                if cls == 0:
                    m = mask.cpu().numpy()
                    # Resize mask to original image size if necessary
                    m = cv2.resize(m, (w, h))
                    area = np.sum(m)
                    if area > max_area:
                        max_area = area
                        person_mask = m

    if person_mask is None:
        print("No person detected.")
        return

    # 1. Save mask to mask.json
    # Binary mask: 1 for person, 0 for background
    binary_mask = (person_mask > 0.5).astype(int)
    mask_list = binary_mask.tolist()
    
    with open(output_json, 'w') as f:
        json.dump(mask_list, f)
    print(f"Mask saved to {output_json}")

    # 2. Create alpha matte on white background
    # Normalize mask to 0-255 for alpha channel
    alpha = (binary_mask * 255).astype(np.uint8)
    
    # White background
    white_bg = np.ones((h, w, 3), dtype=np.uint8) * 255
    
    # Combine: foreground * alpha + background * (1 - alpha)
    # Convert alpha to 3 channels and normalize to 0-1
    alpha_3ch = cv2.merge([alpha, alpha, alpha]) / 255.0
    
    foreground = img.astype(float)
    background = white_bg.astype(float)
    
    matte = foreground * alpha_3ch + background * (1.0 - alpha_3ch)
    matte = matte.astype(np.uint8)
    
    cv2.imwrite(output_image, matte)
    print(f"Alpha matte saved to {output_image}")

if __name__ == "__main__":
    image_path = "/Users/angelani/Desktop/lensmark/person.png"
    output_json = "/Users/angelani/Desktop/lensmark/mask.json"
    output_image = "/Users/angelani/Desktop/lensmark/person_matte.png"
    
    if os.path.exists(image_path):
        segment_person(image_path, output_json, output_image)
    else:
        print(f"File not found: {image_path}")
