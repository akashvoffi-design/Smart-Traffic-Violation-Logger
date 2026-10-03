"""End-to-end API smoke test."""
import urllib.request, json, http.cookiejar, sys

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

# 1. CSRF + Login
csrf_data = json.loads(opener.open('http://localhost:5000/api/auth/csrf').read())
token = csrf_data['csrf_token']

login_data = json.dumps({'username': 'officer1', 'password': 'Officer@123'}).encode()
req = urllib.request.Request('http://localhost:5000/api/auth/login', data=login_data)
req.add_header('Content-Type', 'application/json')
req.add_header('X-CSRFToken', token)
opener.open(req)
print('[1] Login: OK')

# 2. Create violation
vdata = json.dumps({
    'vehicle_number': 'MH12AB5678',
    'violation_type': 'Overspeeding',
    'location': 'Western Express Highway, Mumbai',
    'violation_date': '2026-10-02',
    'fine_amount': '2000',
}).encode()
req2 = urllib.request.Request('http://localhost:5000/api/violations', data=vdata)
req2.add_header('Content-Type', 'application/json')
req2.add_header('X-CSRFToken', token)
r2 = opener.open(req2)
vio = json.loads(r2.read())
vid = vio['violation']['id']
ptok = vio['violation']['public_token']
cnum = vio['violation']['challan_number']
stat = vio['violation']['status']
print(f'[2] Created: {cnum} (id={vid}), status={stat}')
assert stat == 'UNPAID', f"Expected UNPAID, got {stat}"

# 3. QR
qr_r = opener.open(f'http://localhost:5000/api/violations/{vid}/qr')
ct = qr_r.headers.get('Content-Type')
print(f'[3] QR Content-Type: {ct}')
assert 'image/png' in ct

# 4. Mark paid
req3 = urllib.request.Request(f'http://localhost:5000/api/violations/{vid}/status', method='PATCH')
req3.add_header('Content-Type', 'application/json')
req3.add_header('X-CSRFToken', token)
r3 = opener.open(req3)
paid = json.loads(r3.read())
new_status = paid['violation']['status']
paid_at = paid['violation']['paid_at']
print(f'[4] Marked paid: status={new_status}, paid_at={paid_at[:10]}')
assert new_status == 'PAID'

# 5. Double-paid should 400
try:
    req4 = urllib.request.Request(f'http://localhost:5000/api/violations/{vid}/status', method='PATCH')
    req4.add_header('Content-Type', 'application/json')
    req4.add_header('X-CSRFToken', token)
    opener.open(req4)
    print('[5] ERROR: double PAID should have been 400')
    sys.exit(1)
except urllib.error.HTTPError as e:
    print(f'[5] Double-paid blocked: {e.code} (correct)')
    assert e.code == 400

# 6. Public endpoint - check field whitelist
pub = json.loads(opener.open(f'http://localhost:5000/public/challans/{ptok}').read())
c = pub['challan']
required = {'challan_number','vehicle_number','violation_type','location','violation_date','fine_amount','status'}
forbidden = {'id','created_by','public_token','officer'}
present = set(c.keys())
print(f'[6] Public fields: {sorted(present)}')
assert required.issubset(present), f"Missing: {required - present}"
assert not forbidden.intersection(present), f"Leaking: {forbidden.intersection(present)}"
print('[6] Public endpoint: field whitelist OK')

# 7. Bad token returns 404
try:
    opener.open('http://localhost:5000/public/challans/bad-token-xyz-123')
    print('[7] ERROR: bad token should be 404')
    sys.exit(1)
except urllib.error.HTTPError as e:
    print(f'[7] Bad token: {e.code} (correct)')
    assert e.code == 404

# 8. Dashboard
dm = json.loads(opener.open('http://localhost:5000/api/dashboard/summary').read())
print(f'[8] Dashboard: total={dm["total"]}, paid={dm["paid"]}, unpaid={dm["unpaid"]}, today={dm["today"]}')
assert dm['total'] > 0

print('\n✅ ALL CHECKS PASSED')
