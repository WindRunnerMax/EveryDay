import os
from PIL import Image  # Pillow

max_width = 1080
max_height = 1080


def remove_alpha_channel(img):
    """Remove the alpha channel from the image."""
    # 先保留 alpha 通道
    rgba_img = img.convert("RGBA")
    # 创建一个白色背景的图像, 大小与 PNG 图像相同
    white_background = Image.new("RGBA", rgba_img.size, (255, 255, 255, 255))
    # 将 PNG 图像粘贴到白色背景上, 使用 PNG 图像本身的 alpha 通道
    combined_img = Image.alpha_composite(white_background, rgba_img)
    # 转换为 RGB 模式, 移除 alpha 通道
    rgb_img = combined_img.convert("RGB")
    return rgb_img


def convert_to_jpg(input_file_path, output_file_path, quality=90):
    """Convert the image to jpg and save it to the output path."""
    with Image.open(input_file_path) as img:
        original_width, original_height = img.size
        if original_width > max_width or original_height > max_height:
            return compress_image(input_file_path, output_file_path, quality)
        rgb_img = remove_alpha_channel(img)
        output_file_path = output_file_path.replace(".png", ".jpg")
        rgb_img.save(output_file_path, format="jpeg",
                     optimize=True, quality=quality)
        return output_file_path


def compress_image(input_file_path, output_file_path, quality=80):
    """Compress the image, resize it and save it to the output path."""
    with Image.open(input_file_path) as img:
        # 获取原图尺寸
        original_width, original_height = img.size
        # 计算缩小比例，并重新计算宽度和高度
        aspect_ratio = original_width / original_height
        if original_width > max_width or original_height > max_height:
            if aspect_ratio > 1:
                # 宽 > 高
                new_width = max_width
                new_height = int(max_width / aspect_ratio)
            else:
                # 高 > 宽
                new_height = max_height
                new_width = int(max_height * aspect_ratio)
            img = img.resize((new_width, new_height), Image.LANCZOS)
        rgb_img = remove_alpha_channel(img)
        output_file_path = output_file_path.replace(".png", ".jpg")
        rgb_img.save(output_file_path, format="jpeg",
                     optimize=True, quality=quality)
        return output_file_path


def scan_and_compress_images(directory):
    """
    Scan the directory for .png and .jpg files larger than size_threshold and compress them.
    """
    size_threshold = 2 * 1024 * 1024  # 2MB
    compressed_files = []
    for root, _, files in os.walk(directory):
        for file_name in files:
            if not file_name.lower().endswith((".png", ".jpg", ".jpeg")):
                continue
            file_path = os.path.join(root, file_name)
            file_size = os.path.getsize(file_path)
            output_file_path = os.path.join(root, f".temp/{file_name}")
            # 不处理 .temp 目录 以及 Picture 目录
            if file_path.find(".temp") != -1 or file_path.find("Picture") > -1:
                continue
            # 按需创建 .temp 目录
            if not os.path.exists(os.path.join(root, ".temp")):
                os.makedirs(os.path.join(root, ".temp"))
            if file_size > size_threshold:
                # 如果文件大小超过阈值, 压缩图片长宽以及质量, 并转换为 jpg 格式
                output_file_path = compress_image(
                    file_path, output_file_path, 80)
            elif file_name.endswith(".png"):
                # 如果是 png 图片, 压缩质量并转换为 jpg 格式
                output_file_path = convert_to_jpg(
                    file_path, output_file_path, 90)
            else:
                continue
            output_file_size = os.path.getsize(output_file_path)
            # 如果压缩后的文件比原文件大, 则删除压缩后的文件
            if output_file_size > file_size:
                os.remove(output_file_path)
                continue
            print(
                f"Convert: {file_size / (1024*1024):.2f}MB => {output_file_size / (1024*1024):.2f}MB"
            )
            # 删除原文件, 替换为压缩后的文件
            os.remove(file_path)
            os.rename(output_file_path,
                      output_file_path.replace("/.temp", ""))
            print(f"{file_path}")
            print(f"{output_file_path}")
            # 存储原文件名
            compressed_files.append(file_name)
    return compressed_files


def replace_md_file_content(directory):
    """
    Replace the content of the markdown file with the compressed image file name.
    """
    for root, _, files in os.walk(directory):
        for file_name in files:
            if not file_name.lower().endswith((".md")):
                continue
            file_path = os.path.join(root, file_name)
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
                raw_content = content
            for file_name in compressed_files:
                new_file_name = file_name.replace(".png", ".jpg")
                content = content.replace(
                    f"screenshots/{file_name}", f"screenshots/{new_file_name}")
            if raw_content != content:
                print(f"Replace: {file_path}")
                with open(file_path, "w", encoding="utf-8") as file:
                    file.write(content)


if __name__ == "__main__":
    # Replace with the path to your directory
    directory_to_scan = os.path.realpath(os.path.join(os.getcwd(), "../"))
    compressed_files = scan_and_compress_images(directory_to_scan)
    replace_md_file_content(directory_to_scan)
