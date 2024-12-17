import os
from PIL import Image


def compress_image(input_file_path, output_file_path, quality=85, max_width=800, max_height=800):
    """Compress the image, resize it and save it to the output path."""
    with Image.open(input_file_path) as img:
        # 获取原图尺寸
        original_width, original_height = img.size

        # 计算缩小比例，并重新计算宽度和高度
        aspect_ratio = original_width / original_height
        if original_width > max_width or original_height > max_height:
            if aspect_ratio > 1:  # 宽>高
                new_width = max_width
                new_height = int(max_width / aspect_ratio)
            else:  # 高>宽
                new_height = max_height
                new_width = int(max_height * aspect_ratio)
            img = img.resize((new_width, new_height), Image.LANCZOS)
        else:
            new_width = original_width
            new_height = original_height

        img.save(output_file_path, optimize=True, quality=quality)


def scan_and_compress_images(directory, size_threshold=800*1024, quality=85):
    """
    Scan the directory for .png and .jpg files larger than size_threshold and compress them.

    :param directory: Directory to scan for images.
    :param size_threshold: Size threshold in bytes (default 800KB).
    :param quality: Quality of the compressed image (default 85).
    """
    for root, _, files in os.walk(directory):
        for file_name in files:
            if file_name.lower().endswith((".png", ".jpg", ".jpeg")):
                file_path = os.path.join(root, file_name)
                file_size = os.path.getsize(file_path)

                if file_size > size_threshold and file_path.find(".temp") == -1:
                    print(
                        f"Compressing: {file_path} {file_size / (1024*1024):.2f} MB"
                    )
                    if not os.path.exists(os.path.join(root, ".temp")):
                        os.makedirs(os.path.join(root, ".temp"))
                    output_file_path = os.path.join(root, f".temp/{file_name}")
                    compress_image(file_path, output_file_path, quality)


if __name__ == "__main__":
    # Replace with the path to your directory
    directory_to_scan = os.path.realpath(os.path.join(os.getcwd(), "../"))
    scan_and_compress_images(directory_to_scan)
