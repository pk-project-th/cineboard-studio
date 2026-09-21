from PIL import Image
import os

media_dir = r"C:\Users\Marketing\.gemini\antigravity\scratch\cineprompt-hub\client\public\media"

def save_crop(img, box, name):
    cropped = img.crop(box)
    if cropped.mode == "RGBA":
        cropped = cropped.convert("RGB")
    cropped.save(os.path.join(media_dir, name), quality=95)

# 1. Sak character sheet
im_sak = Image.open(os.path.join(media_dir, "media_1789110216019.png"))
save_crop(im_sak, (5, 30, 775, 520), "sak_character_sheet.jpg")
save_crop(im_sak, (945, 450, 1010, 520), "nu_character_sheet.jpg")

# 2. Joy character sheet
im_joy = Image.open(os.path.join(media_dir, "media_1789110239484.png"))
save_crop(im_joy, (5, 140, 775, 570), "joy_character_sheet.jpg")

# 3. First Frame Fishpond
im_pond = Image.open(os.path.join(media_dir, "media_1789110196690.png"))
save_crop(im_pond, (235, 18, 508, 525), "pond_first_frame.jpg")

# 4. Individual variations from media_1789110229769.png
im_board = Image.open(os.path.join(media_dir, "media_1789110229769.png"))
save_crop(im_board, (25, 140, 345, 575), "scene_tomyum_1.jpg")
save_crop(im_board, (355, 140, 675, 575), "scene_tomyum_2.jpg")
save_crop(im_board, (685, 140, 1005, 575), "scene_tomyum_3.jpg")
save_crop(im_board, (25, 585, 345, 755), "scene_tomyum_4.jpg")
save_crop(im_board, (355, 585, 675, 755), "scene_pond_1.jpg")
save_crop(im_board, (685, 585, 1005, 755), "scene_pond_2.jpg")

print("All visual assets cropped and saved successfully!")
