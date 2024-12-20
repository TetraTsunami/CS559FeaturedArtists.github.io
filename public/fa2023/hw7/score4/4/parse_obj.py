import os
import base64

# parse all 3D models and output them to a single JSON object global
os.chdir("/Users/zeke/Desktop/VSCProjects /Boolets-CS559/p7")


MODELS = {}


for file in os.listdir("objs"):


    with open(f'objs/{file}', "r") as obj:
            
            MODELS[file] = {}
            MODELS[file]['v'] = []
            MODELS[file]['vt'] = []
            MODELS[file]['vn'] = []
            MODELS[file]['meshes'] = {}


            curr_mat = ""
            for line in obj:
                contents = line.split()
                if len(contents) > 0 and contents[0] != "#": # not a comment, len is non-zero
                    if contents[0] == "mtllib": 
                        MODELS[file]['mtllib'] = contents[1]
                    elif contents[0] in ['vt', 'vn', 'v']:
                        data = [float(i) for i in contents[1:]]
                        MODELS[file][contents[0]].append(data)
                    elif contents[0] == 'f':
                        pt = contents[1:]
                        face = []
                        for p in pt:
                            face.append([int(i) for i in p.split("/")])

                        MODELS[file]['meshes'][curr_mat].append(face)
                    elif contents[0] == 'usemtl':
                        if contents[1] not in MODELS[file]['meshes']:
                            MODELS[file]['meshes'][contents[1]] = []
                        curr_mat = contents[1]

            # traverse the meshes, replace the indices with their respective coordinate
            # assumes that v, vt, and vn are specified
            # for easy loading into VBOs
            for mesh in MODELS[file]['meshes']:
                V = []
                VT = []
                VN = []
                for FACE in MODELS[file]['meshes'][mesh]:
                    for CORNER in FACE:
                        if len(CORNER) >= 1:
                            V.append(MODELS[file]['v'][CORNER[0]-1])
                        if len(CORNER) >= 2:
                            VT.append(MODELS[file]['vt'][CORNER[1]-1])
                        if len(CORNER) >= 3:
                            VN.append(MODELS[file]['vn'][CORNER[2]-1])
                
                MODELS[file]['meshes'][mesh] = [V, VT, VN]  
              
            #print([len(MODELS[file]['meshes'][mesh][0]) for mesh in MODELS[file]['meshes']])
            #print(len(MODELS[file]['meshes']['m0'][0]))

'''

NEW
  

print(f'VEEE {V}')
print(f'VT {VT}')
print(f'VN {VN}')
break



MODELS[file] = {'objects': []}
for line in obj:
    contents = line.split()
    if len(contents) > 0:
        if contents[0] == "mtllib": 
            MODELS[file]['mtllib'] = contents[1]
        elif contents[0] == "o":
                MODELS[file]['objects'].append({})
        elif contents[0] in ['f', 'vt', 'vn', 'v']:
            print(MODELS)
            if contents[0] not in MODELS[file]['objects'][-1]:
                    MODELS[file]['objects'][-1][contents[0]] = []
            if contents[0] != 'f':
                data = [float(i) for i in contents[1:]]
                MODELS[file]['objects'][-1][contents[0]].append(data)
            else:
                pt = contents[1:]
                face = []
                for p in pt:
                    face.append([int(i) for i in p.split("/")])
                MODELS[file]['objects'][-1][contents[0]].append(face)
        elif contents[0] == 'usemtl':
                MODELS[file]['objects'][-1]['usemtl'] = contents[1]
    '''
          
TEXTURES = {}
for file in os.listdir("textures"):
    with open(f'textures/{file}', 'rb') as texture:
        image_base64 = base64.b64encode(texture.read())
        TEXTURES[file] = f'data:/image/png;base64,{image_base64.decode("utf-8")}'

MATERIALS = {}
for file in os.listdir("mtl"):
    with open(f'mtl/{file}', "r") as mtl:
        MATERIALS[file] = {}
        cur_mat = ''
        mtl.readline()
        
        for line in mtl:
            contents = line.split()
            if len(contents) > 0 and contents[0] != "#":
                if contents[0] == 'newmtl':
                    MATERIALS[file][contents[1]] = {}
                    cur_mat = contents[1]
                elif contents[0] != 'map_Kd':
                    data = [float(i) for i in contents[1:]]
                    if len(data) == 1:
                        MATERIALS[file][cur_mat][contents[0]] = data[0]
                    else:
                        MATERIALS[file][cur_mat][contents[0]] = data
                else:
                    MATERIALS[file][cur_mat][contents[0]] = contents[1]
               

with open("models.js", "w") as f:
    f.write(f'const MODELS = {MODELS};')
    f.write("\n")
    f.write(f'const TEXTURES = {TEXTURES};')
    f.write("\n")
    f.write(f'const MATERIALS = {MATERIALS};')
