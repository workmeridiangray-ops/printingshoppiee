import openpyxl, json, re, collections
wb=openpyxl.load_workbook('/mnt/user-data/uploads/2f0e6ed6-kraftix_prices_172_products.xlsx',read_only=True,data_only=True)
print([r for r in wb['README'].iter_rows(values_only=True)])
meta={}
for r in wb['Products'].iter_rows(min_row=2,values_only=True):
    if r[1]: meta[r[1]]=r
P=collections.OrderedDict()
for r in wb['Prices'].iter_rows(min_row=2,values_only=True):
    slug,size,opt,q,unit,total=r[:6]
    if not slug or total is None: continue
    d=P.setdefault(slug,{'sizes':[],'opts':[],'rows':{}})
    size=str(size or 'Standard'); opt=str(opt or 'Standard')
    if size not in d['sizes']: d['sizes'].append(size)
    if opt not in d['opts']: d['opts'].append(opt)
    k=(d['sizes'].index(size),d['opts'].index(opt))
    d['rows'].setdefault(k,[]).append([int(q),round(float(total))])
out={}
for s,d in P.items():
    out[s]={'s':d['sizes'],'o':d['opts'],'r':[[a,b,sorted(t)] for (a,b),t in d['rows'].items()]}
js=json.dumps(out,separators=(',',':'),ensure_ascii=False)
open('prices.json','w').write(js)
print(len(out),len(js))
