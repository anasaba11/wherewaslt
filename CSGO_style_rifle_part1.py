# Blender Python script — Part 1: low-poly FPS rifle blockout
# How to use: Blender > Scripting workspace > New > paste this script > Run Script.
# Creates a generic tactical rifle-inspired blockout, not an exact game asset.
import bpy
from mathutils import Vector

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials):
    for block in list(datablocks):
        if block.users == 0:
            datablocks.remove(block)

# Materials
def mat(name, color, metallic=0.0, roughness=0.55):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Metallic'].default_value=metallic; bs.inputs['Roughness'].default_value=roughness
    return m
body=mat('Graphite polymer',(0.075,0.09,0.10),0.18)
metal=mat('Dark gunmetal',(0.19,0.22,0.23),0.72,0.3)
black=mat('Rubber black',(0.025,0.028,0.03),0.0,0.8)
accent=mat('Muted olive detail',(0.16,0.19,0.12),0.15)

# Cuboid helper. Rifle runs along X; front/muzzle is +X.
def cube(name, loc, scale, material, bevel=0.06):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object; o.name=name; o.dimensions=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    if bevel:
        mod=o.modifiers.new('Small edge bevels','BEVEL'); mod.width=bevel; mod.segments=2
        o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
    return o

def cyl(name, loc, radius, depth, material, rotation=(0,1.5708,0), vertices=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rotation)
    o=bpy.context.object; o.name=name; o.data.materials.append(material)
    bevel=o.modifiers.new('Edge highlight','BEVEL'); bevel.width=0.025; bevel.segments=2
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

# Stock and receiver
cube('Rear stock',( -2.05,0,0.12),(1.15,0.34,0.42),body,0.12)
cube('Stock butt pad',(-2.66,0,0.12),(0.14,0.39,0.48),black,0.045)
cube('Upper receiver',(-0.55,0,0.25),(1.75,0.42,0.46),body,0.07)
cube('Receiver side plate',(-0.55,-0.218,0.24),(0.92,0.025,0.22),metal,0.025)
cube('Lower receiver',(-0.52,0,-0.04),(1.08,0.36,0.22),metal,0.045)
# Barrel and muzzle
cube('Handguard',(0.62,0,0.23),(1.05,0.38,0.38),body,0.06)
cyl('Barrel',(1.48,0,0.25),0.085,0.78,metal)
cyl('Muzzle device',(1.91,0,0.25),0.12,0.22,black)
# Handguard rail segments
for i in range(7):
    cube('Handguard top rail %02d'%i,(0.28+i*0.13,0,0.445),(0.09,0.22,0.045),metal,0.012)
for side in (-1,1):
    for i in range(5):
        cube('Side rail %s %02d'%(side,i),(0.32+i*0.17,side*0.205,0.22),(0.11,0.035,0.08),metal,0.012)
# Magazine, grip and trigger guard
cube('Magazine well',(-0.33,0,-0.28),(0.42,0.3,0.28),black,0.035)
mag=cube('Curved style magazine',(-0.28,0,-0.59),(0.38,0.25,0.55),body,0.055)
mag.rotation_euler[1]=-0.10
cube('Magazine base',(-0.25,0,-0.88),(0.42,0.28,0.08),metal,0.02)
grip=cube('Pistol grip',(-0.72,0,-0.43),(0.28,0.30,0.55),black,0.06); grip.rotation_euler[1]=-0.22
cube('Trigger guard',(-0.91,0,-0.18),(0.25,0.08,0.08),metal,0.025)
cube('Trigger',(-0.91,0,-0.25),(0.045,0.045,0.16),metal,0.012)
# Sights
cube('Rear sight base',(-1.18,0,0.52),(0.18,0.15,0.09),metal,0.025)
cube('Rear sight post',(-1.18,0,0.61),(0.06,0.08,0.12),black,0.015)
cube('Front sight base',(1.25,0,0.48),(0.13,0.15,0.08),metal,0.02)
cube('Front sight post',(1.25,0,0.57),(0.04,0.05,0.13),black,0.012)
# Charging handle and selector details
cube('Charging handle',(-1.18,-0.25,0.31),(0.26,0.08,0.08),metal,0.02)
cyl('Selector pin',(-0.88,-0.235,0.17),0.055,0.035,metal,rotation=(1.5708,0,0),vertices=12)
# Simple stylized engraved stripe details
for i in range(4):
    cube('Receiver groove %02d'%i,(-0.82+i*0.16,-0.237,0.31),(0.075,0.012,0.035),black,0.006)

# Ground and camera-friendly lighting
floor_mat=mat('Studio floor',(0.035,0.043,0.05),0.0,0.9)
cube('Display ground',(0,0,-1.13),(200,200,0.12),floor_mat,0)
# Set origin and selection to rifle objects; useful first blockout view
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
    if o.name != 'Display ground': o.select_set(True)
# Set viewport to material color and frame all
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_distance=7.5
        area.spaces.active.region_3d.view_location=Vector((-0.25,0,0))
        area.spaces.active.shading.color_type='MATERIAL'
print('Part 1 complete: generic low-poly FPS rifle blockout created.')
