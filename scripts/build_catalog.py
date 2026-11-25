import json,re
P=json.load(open('prices.json'))
NAMES={'magneticcards':'Magnetic Cards','polybagcourier(not-printed)':'Courier Poly Bags (Plain, Unprinted)','whitebubbleenvelope(not-printed)':'White Bubble Envelopes (Plain, Unprinted)','hang-tags-fashion':'Hang Tags (Fashion)','thank-you-cards-fashion':'Thank You Cards (Fashion)','flyers-leaflets':'Flyers & Leaflets','round-neck-t-shirt-(not-printed)':'Round Neck T-Shirt (Plain, Unprinted)','custom-bubble':'Custom Printed Bubble Bags','custom-silver-bubble':'Custom Silver Bubble Bags','box-hb':'Product Box (Health & Beauty)','browntape':'Brown Printed Tape','whitetape':'White Printed Tape','pack-tape':'Packaging Tape','dcutbags':'D-Cut Bags','domesticker':'Dome (3D Raised) Stickers','foamboardmenu':'Foam Board Menu','foamsigns':'Foam Board Signs','foldtags':'Folded Tags','frontadhesive':'Front Adhesive Stickers','glowindark':'Glow in the Dark Stickers','keycardsleeve':'Key Card Sleeves','kraftbox':'Kraft Box','kraftcandlelabels':'Kraft Candle Labels','largestickers':'Large Stickers','laptop':'Laptop Stickers','mailerenvelope':'Mailer Envelopes','nontearcards':'Non-Tearable Cards','nonteartags':'Non-Tearable Tags','papercup':'Paper Cups','polybag':'Printed Poly Bags','blackpolybag':'Black Printed Poly Bags','premiumlabel':'Premium Labels','rollonlabels':'Roll-on Labels','scmailerbox':'Small Corrugated Mailer Box','shinnylabels':'Shiny Labels','silvergoldvinyl':'Silver & Gold Vinyl Stickers','soapbox':'Soap Box','tentcard':'Tent Cards','tucktopbox':'Tuck Top Box','voidlabel':'Void / Tamper-Evident Labels','spotuvbusinesscards':'Spot UV Business Cards','spotuv-tag':'Spot UV Tags','spot-thankyou':'Spot UV Thank You Cards','foil-thankyou':'Foil Thank You Cards','foilpaperbag':'Foil Paper Bags','honeylabel':'Honey Labels','glassbottlelabel':'Glass Bottle Labels','custompaperbox':'Custom Paper Box','custompaperbox-bulk':'Custom Paper Box (Bulk)','custom-cosmeticbox':'Cosmetic Box','custom-deskorganiser':'Custom Desk Organiser','customer-frosted-zipper':'Custom Frosted Zipper Bags','corner-gaurd':'Corner Guards','trans-stickers':'Transparent Stickers','edgeseal-fb':'Edge Seal Labels (Food)','sealstickers-fb':'Seal Stickers (Food)','headercards':'Header Cards','gift-voucher':'Gift Vouchers','premium-luggage':'Premium Luggage Tags','wrapping-paper-150':'Wrapping Paper (150 gsm)','wrappingpaper-garment':'Garment Wrapping Paper','wrapping-roll':'Wrapping Paper Roll','white-ink-hb':'White Ink Labels (Health & Beauty)','white-ink-labels-pfd':'White Ink Labels (Packed Food)','containerlabels-pfb':'Container Labels (Packed Food)','dryfruit-labels-pfb':'Dry Fruit Labels','spicepicklelabel-pfb':'Spice & Pickle Labels','jamlabels-pfd':'Jam Labels','thankyoucard-pfb':'Thank You Cards (Packed Food)','water-oil-proof-labels(fb)':'Water & Oil Proof Labels (Food)','economical-packedf-b':'Economical Labels (Packed Food)','economical-labels-fb':'Economical Labels (Food & Beverage)','economical-healthbeauty':'Economical Labels (Health & Beauty)','economical-perfume-oils':'Economical Labels (Perfume & Oils)','waterproof-healthbeauty':'Waterproof Labels (Health & Beauty)','premiumshinylabels-hb':'Premium Shiny Labels (Health & Beauty)','shiny-labels-perfume':'Shiny Labels (Perfume)','super-durable-hi-tac-stickers':'Super Durable Hi-Tack Stickers','kraft-business-cards-':'Kraft Business Cards','bi-brochures':'Bi-fold Brochures','collapse-rigid-box':'Collapsible Rigid Box','envelope-rigid':'Rigid Envelopes','paper-bags-pfd':'Paper Bags (Packed Food)','paperbag-fashion':'Paper Bags (Fashion)','fulldiecutstickers':'Full Die-Cut Stickers','foodservicelabels':'Food Service Labels','standuppouch-notprinted':'Stand-up Pouch (Plain)','frosted-zipper-ready':'Frosted Zipper Bags (Ready)'}
SUF=[('-pfb',' (Packed Food)'),('-pfd',' (Packed Food)'),('-fb',' (Food & Beverage)'),('-hb',' (Health & Beauty)'),('-bulk',' (Bulk)')]
def name(s):
    if s in NAMES: return NAMES[s]
    t=s; extra=''
    if '(not-printed)' in t: t=t.replace('(not-printed)',''); extra=' (Plain, Unprinted)'
    for a,b in SUF:
        if t.endswith(a): t=t[:-len(a)]; extra=b+extra; break
    t=t.strip('-').replace('-',' ')
    t=t.title().replace('Businesscards',' Business Cards').replace('Thankyou','Thank You').replace('  ',' ');return t+extra
def cat(s):
    if 'not-printed' in s or s in('frosted-zipper-ready','standuppouch-notprinted','label-applicator','corner-gaurd'): return 'Ready to Ship'
    if 'bulk' in s: return 'Bulk / B2B'
    if s in ('foil-thankyou','spot-thankyou'): return 'Cards & Stationery'
    if s=='white-ink-hb': return 'Stickers & Labels'
    if s.startswith('economical') or s=='waterproof-healthbeauty': return 'Stickers & Labels'
    if re.search(r'box|mailer-box|scmailer|food-tray|tucktop|soapbox',s) and 'mailerenvelope' not in s: return 'Boxes'
    if re.search(r'label|sticker|seal|void|laptop|glow|magnet-sticker|frontadhesive|gadget|wall-sticker|bumper|glass-sticker|silvergold|domesticker|trans-',s): return 'Stickers & Labels'
    if re.search(r'bag|pouch|tape|bubble|sleeve|wrapping|ribbon|envelope|zipper|papercup|dust-cover',s): return 'Packaging'
    if re.search(r'card|letterhead|certificate|voucher|bookmark|tag|keycard',s): return 'Cards & Stationery'
    if re.search(r'flyer|leaflet|brochure|poster|banner|standee|dangler|sign|menu|tentcard|doorhanger|placemat|coaster|header',s): return 'Marketing'
    return 'Gifting & Merch'
def kind(s,c):
    if c=='Boxes': return 'box'
    if 'tape' in s: return 'tape'
    if 'bag' in s or 'pouch' in s: return 'bag'
    if 'tag' in s: return 'tag'
    if 'label' in s: return 'label'
    if c=='Stickers & Labels': return 'sticker'
    if 'card' in s or 'letterhead' in s or 'certificate' in s or 'voucher' in s: return 'card'
    if c=='Marketing': return 'poster'
    if 'thank' in s or 'envelope' in s: return 'postcard'
    return 'poster'
cats=[]
for s,d in P.items():
    best=None
    for si,oi,t in d['r']:
        q,tot=t[0]
        if best is None or q<best[0] or (q==best[0] and tot<best[1]): best=(q,tot)
    c=cat(s)
    cats.append({'slug':s,'name':name(s),'cat':c,'kind':kind(s,c),'moq':best[0],'from':best[1],'sizes':len(d['s'])})
json.dump(cats,open('catalog.json','w'),separators=(',',':'),ensure_ascii=False)
import collections; print(collections.Counter(c['cat'] for c in cats))
[print(c['cat'][:6],'|',c['name']) for c in cats]
