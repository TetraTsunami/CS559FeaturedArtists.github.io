import struct
import json

def parse_binary_stl(file_path):
    vertices = []
    
    with open(file_path, 'rb') as file:
        # Skip the 80-byte header
        file.seek(80)

        # Read the number of triangles (4-byte unsigned int)
        num_triangles = struct.unpack('<I', file.read(4))[0]

        for _ in range(num_triangles):
            # Each triangle consists of:
            # - Normal vector (ignored, 12 bytes)
            # - Three vertices (each 12 bytes for x, y, z)
            # - Attribute byte count (ignored, 2 bytes)
            
            # Skip the normal vector
            file.seek(12, 1)

            # Read the 3 vertices (3 points, 12 bytes each)
            for _ in range(3):
                x, y, z = struct.unpack('<fff', file.read(12))
                vertex = {
                    "x": round(x, 4),   # Optional rounding for precision
                    "y": round(-y, 4),  # Negate Y for consistency
                    "z": round(z, 4)
                }
                vertices.append(vertex)

            # Skip the attribute byte count (2 bytes)
            file.seek(2, 1)

    return vertices

def save_to_json(vertices, output_file):
    with open(output_file, 'w') as f:
        json.dump(vertices, f, indent=4)

# Example usage
stl_file = '/home/flash/Documents/Guns-n-Poses/floatingMuzzle.stl'
output_file = '/home/flash/Documents/Guns-n-Poses/fm.json'

vertices = parse_binary_stl(stl_file)
save_to_json(vertices, output_file)

print(f"Vertices saved to {output_file} with inverted Y-axis.")
