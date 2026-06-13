from rapidocr_onnxruntime import RapidOCR
from pathlib import Path

imgs = [
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\ca73c1408e8c43d6a7292bf79b85046f_a15e337e01091bf5d7c0ed752ae301c7.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\ea038967173a42efa39d941ae711d689_1e46e1c3f64b423dccabb6f74889b7e3.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\74b1406ac5de48e5ac164d6d030245e1_e891db395d03fa38ef91f42f5cece986.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\5aa6a6de8f1f405d837fa8034e2c65f3_090e7ec62fca89d0d4789b6255611886.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\0611899dcc0540bc8567ee15b0498393_13a0439dfc014f2739344ae68d94f038.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\45f3f72b35e54309aeb6a43d9da01d0f_be7cedd523d5e19fbe1b684ffd19dac4.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\033f5b1ad87e4b16beb2d1591bea13bd_96310bde349ae4f1615a4ddd53f078f1.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\73190e4d76dc4c608cf893db18ba8c4f_1183bf5c6958c275efeb30a0a15e1cfd.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\e80ca2ab352540d99395df2d1d843b5e_80f791b84fe77583a2ce7ea0e68ce3fa.jpg',
 r'C:\Users\83668\.qwenpaw\workspaces\default\media\1c1dc3f3138144f78811198bdede4615_88daace46ba4430de90eaa2745d97e57.jpg',
]
ocr = RapidOCR()
out=[]
for idx,p in enumerate(imgs,1):
    result, elapse = ocr(p)
    out.append(f'===== IMAGE {idx}: {Path(p).name} =====')
    if result:
        # sort roughly top-to-bottom then left-to-right
        rows=[]
        for box, text, score in result:
            y=sum(pt[1] for pt in box)/4
            x=sum(pt[0] for pt in box)/4
            rows.append((y,x,text,score))
        rows.sort()
        for y,x,text,score in rows:
            out.append(f'{text}')
    else:
        out.append('(no text)')
    out.append('')
Path(r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict\ocr_schedule.txt').write_text('\n'.join(out), encoding='utf-8')
print('done')
