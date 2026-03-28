import base64
import struct
import zlib

# Simple solid color PNG generator
def create_simple_png(size, filename, r=102, g=126, b=234):
    width = height = size
    
    # Create pixel data (RGBA)
    pixels = []
    for y in range(height):
        for x in range(width):
            # Add some gradient effect
            factor = 1 - (max(abs(x - width/2), abs(y - height/2)) / (width/2)) * 0.3
            pixels.extend([int(r * factor), int(g * factor), int(b * factor), 255])
    
    def png_chunk(chunk_type, data):
        chunk_len = struct.pack('>I', len(data))
        chunk_crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return chunk_len + chunk_type + data + chunk_crc
    
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = png_chunk(b'IHDR', ihdr_data)
    
    raw_data = b''
    for row in range(height):
        raw_data += bytes([0])  # filter byte
        row_start = row * width * 4
        raw_data += bytes(pixels[row_start:row_start + width * 4])
    
    compressed = zlib.compress(raw_data, 9)
    idat = png_chunk(b'IDAT', compressed)
    iend = png_chunk(b'IEND', b'')
    
    with open(filename, 'wb') as f:
        f.write(signature + ihdr + idat + iend)

create_simple_png(16, 'icon16.png')
create_simple_png(48, 'icon48.png')
create_simple_png(128, 'icon128.png')
print("Icons created successfully!")
