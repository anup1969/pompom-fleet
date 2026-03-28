#!/bin/bash
BASE="https://fleet.pompombus.com"
COOKIE="/tmp/fleet-test-cookies.txt"
PASS=0
FAIL=0
TOTAL=0

result() {
  TOTAL=$((TOTAL+1))
  if [ "$1" = "PASS" ]; then
    PASS=$((PASS+1))
    echo "  PASS: $2"
  else
    FAIL=$((FAIL+1))
    echo "  FAIL: $2 -- $3"
  fi
}

echo "==========================================="
echo "  POMPOM FLEET MANAGER - AUTOMATED TESTS"
echo "==========================================="
echo ""

echo ">> 1. AUTHENTICATION"

# A-01: Valid login
RES=$(curl -s -c $COOKIE "$BASE/api/auth/login" -X POST -H "Content-Type: application/json" -d '{"email":"admin@pompom.com","password":"admin123"}')
if echo "$RES" | grep -q "success"; then
  result "PASS" "A-01: Valid login"
else
  result "FAIL" "A-01: Valid login" "$RES"
fi

# A-02: Wrong password
RES=$(curl -s "$BASE/api/auth/login" -X POST -H "Content-Type: application/json" -d '{"email":"admin@pompom.com","password":"wrongpass"}')
if echo "$RES" | grep -qi "error\|invalid\|incorrect"; then
  result "PASS" "A-02: Wrong password rejected"
else
  result "FAIL" "A-02: Wrong password rejected" "$RES"
fi

# A-07: Route protection
RES=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/buses")
if [ "$RES" = "307" ] || [ "$RES" = "302" ] || [ "$RES" = "308" ]; then
  result "PASS" "A-07: Unauthenticated redirect to login"
else
  result "FAIL" "A-07: Unauthenticated redirect" "Got $RES"
fi

# A-08: Session info
ME=$(curl -s -b $COOKIE "$BASE/api/auth/me")
TID=$(echo "$ME" | python -c "import sys,json; print(json.load(sys.stdin).get('tenant',{}).get('id',''))" 2>/dev/null)
USER_ID=$(echo "$ME" | python -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))" 2>/dev/null)
UNAME=$(echo "$ME" | python -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('name',''))" 2>/dev/null)
if [ -n "$TID" ]; then
  result "PASS" "A-08: Session returns user+tenant ($UNAME)"
else
  result "FAIL" "A-08: Session returns user+tenant" "$ME"
fi

echo ""
echo ">> 2. ALL PAGES LOAD (200)"
for page in "/" "/buses" "/staff" "/expenses" "/attendance" "/fuel" "/vendors" "/directory" "/documents" "/insurance" "/masters" "/login"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -b $COOKIE "$BASE$page")
  if [ "$CODE" = "200" ]; then
    result "PASS" "Page $page = $CODE"
  else
    result "FAIL" "Page $page" "Got $CODE"
  fi
done

echo ""
echo ">> 3. BUSES CRUD"

BUS=$(curl -s -b $COOKIE "$BASE/api/buses" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"vehicle_no\":\"GJ-TEST-BUS1\",\"make_model\":\"Tata Starbus\",\"seats\":52,\"odometer\":15000}")
BUS_ID=$(echo "$BUS" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$BUS_ID" ]; then
  result "PASS" "B-01: Add bus"
else
  result "FAIL" "B-01: Add bus" "$BUS"
fi

EDIT=$(curl -s -b $COOKIE "$BASE/api/buses/$BUS_ID" -X PUT -H "Content-Type: application/json" -d '{"odometer":20000}')
NEW_ODO=$(echo "$EDIT" | python -c "import sys,json; print(json.load(sys.stdin).get('odometer',''))" 2>/dev/null)
if [ "$NEW_ODO" = "20000" ]; then
  result "PASS" "B-03: Edit bus (odometer 20000)"
else
  result "FAIL" "B-03: Edit bus" "$EDIT"
fi

SINGLE=$(curl -s -b $COOKIE "$BASE/api/buses/$BUS_ID")
SV=$(echo "$SINGLE" | python -c "import sys,json; print(json.load(sys.stdin).get('vehicle_no',''))" 2>/dev/null)
if [ -n "$SV" ]; then
  result "PASS" "B-05: Get single bus"
else
  result "FAIL" "B-05: Get single bus" "$SINGLE"
fi

LIST=$(curl -s -b $COOKIE "$BASE/api/buses?tenant_id=$TID")
COUNT=$(echo "$LIST" | python -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$COUNT" -ge 1 ] 2>/dev/null; then
  result "PASS" "B-07: List buses ($COUNT found)"
else
  result "FAIL" "B-07: List buses" "Count=$COUNT"
fi

DEL=$(curl -s -b $COOKIE "$BASE/api/buses/$BUS_ID" -X DELETE)
if echo "$DEL" | grep -q "success"; then
  result "PASS" "B-04: Soft delete bus"
else
  result "FAIL" "B-04: Soft delete bus" "$DEL"
fi

LIST2=$(curl -s -b $COOKIE "$BASE/api/buses?tenant_id=$TID")
HAS=$(echo "$LIST2" | grep -c "$BUS_ID")
if [ "$HAS" = "0" ]; then
  result "PASS" "B-04b: Deleted bus hidden from list"
else
  result "FAIL" "B-04b: Deleted bus still visible"
fi

echo ""
echo ">> 4. STAFF CRUD"

STAFF=$(curl -s -b $COOKIE "$BASE/api/staff" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"name\":\"Test Driver\",\"role\":\"Driver\",\"phone\":\"9825000001\",\"salary\":15000}")
STAFF_ID=$(echo "$STAFF" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$STAFF_ID" ]; then
  result "PASS" "S-01: Add staff"
else
  result "FAIL" "S-01: Add staff" "$STAFF"
fi

SEDIT=$(curl -s -b $COOKIE "$BASE/api/staff/$STAFF_ID" -X PUT -H "Content-Type: application/json" -d '{"salary":18000}')
NSAL=$(echo "$SEDIT" | python -c "import sys,json; print(json.load(sys.stdin).get('salary',''))" 2>/dev/null)
if [ "$NSAL" = "18000" ]; then
  result "PASS" "S-04: Edit staff (salary 18000)"
else
  result "FAIL" "S-04: Edit staff" "$SEDIT"
fi

STAFF2=$(curl -s -b $COOKIE "$BASE/api/staff" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"name\":\"Test Assistant\",\"role\":\"Assistant\",\"phone\":\"9825000002\",\"salary\":10000}")
STAFF2_ID=$(echo "$STAFF2" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$STAFF2_ID" ]; then
  result "PASS" "S-03: Multiple roles exist"
else
  result "FAIL" "S-03: Add assistant" "$STAFF2"
fi

SDEL=$(curl -s -b $COOKIE "$BASE/api/staff/$STAFF_ID" -X DELETE)
if echo "$SDEL" | grep -q "success"; then
  result "PASS" "S-05: Delete staff (soft)"
else
  result "FAIL" "S-05: Delete staff" "$SDEL"
fi

echo ""
echo ">> 5. EXPENSES"

BUS3=$(curl -s -b $COOKIE "$BASE/api/buses" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"vehicle_no\":\"GJ-EXP-BUS\",\"make_model\":\"Force\",\"seats\":26}")
BUS3_ID=$(echo "$BUS3" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

HEAD_ID=$(curl -s -b $COOKIE "$BASE/api/expense-heads?tenant_id=$TID" | python -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)

EXP=$(curl -s -b $COOKIE "$BASE/api/expenses" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"bus_id\":\"$BUS3_ID\",\"head_id\":\"$HEAD_ID\",\"amount\":5000,\"expense_date\":\"2026-03-28\",\"payment_mode\":\"Cash\",\"bill_no\":\"TEST-001\",\"created_by\":\"$USER_ID\"}")
EXP_ID=$(echo "$EXP" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$EXP_ID" ]; then
  result "PASS" "E-01: Add expense (5000)"
else
  result "FAIL" "E-01: Add expense" "$EXP"
fi

EDEL=$(curl -s -b $COOKIE "$BASE/api/expenses/$EXP_ID" -X DELETE)
if echo "$EDEL" | grep -q "success"; then
  result "PASS" "E-03: Delete expense"
else
  result "FAIL" "E-03: Delete expense" "$EDEL"
fi

echo ""
echo ">> 6. ATTENDANCE"

TODAY=$(date +%Y-%m-%d)
ATT=$(curl -s -b $COOKIE "$BASE/api/attendance" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"date\":\"$TODAY\",\"marked_by\":\"$USER_ID\",\"records\":[{\"staff_id\":\"$STAFF2_ID\",\"status\":\"P\",\"remark\":\"\"}]}")
ATTC=$(echo "$ATT" | python -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d,list) else 0)" 2>/dev/null)
if [ "$ATTC" -ge 1 ] 2>/dev/null; then
  result "PASS" "AT-01: Mark attendance ($ATTC records)"
else
  result "FAIL" "AT-01: Mark attendance" "$ATT"
fi

RATT=$(curl -s -b $COOKIE "$BASE/api/attendance?tenant_id=$TID&date=$TODAY")
RC=$(echo "$RATT" | python -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$RC" -ge 1 ] 2>/dev/null; then
  result "PASS" "AT-01b: Attendance persists"
else
  result "FAIL" "AT-01b: Read attendance" "$RATT"
fi

ATT2=$(curl -s -b $COOKIE "$BASE/api/attendance" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"date\":\"$TODAY\",\"marked_by\":\"$USER_ID\",\"records\":[{\"staff_id\":\"$STAFF2_ID\",\"status\":\"L\",\"remark\":\"leave\"}]}")
NEWST=$(echo "$ATT2" | python -c "import sys,json; print(json.load(sys.stdin)[0]['status'])" 2>/dev/null)
if [ "$NEWST" = "L" ]; then
  result "PASS" "AT-05: Upsert works (P changed to L)"
else
  result "FAIL" "AT-05: Upsert" "$ATT2"
fi

echo ""
echo ">> 7. FUEL LOG"

FUEL=$(curl -s -b $COOKIE "$BASE/api/fuel-logs" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"bus_id\":\"$BUS3_ID\",\"date\":\"2026-03-28\",\"litres\":50,\"rate_per_litre\":95.5,\"amount\":4775,\"odometer_reading\":15050,\"station\":\"HP Pump\"}")
FUEL_ID=$(echo "$FUEL" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$FUEL_ID" ]; then
  result "PASS" "F-01: Add fuel entry"
else
  result "FAIL" "F-01: Add fuel" "$FUEL"
fi

echo ""
echo ">> 8. VENDORS"

VEND=$(curl -s -b $COOKIE "$BASE/api/vendors" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"name\":\"Test Mechanic\",\"contact_person\":\"Ramesh\",\"phone\":\"9825099999\",\"category\":\"Mechanic\"}")
VEND_ID=$(echo "$VEND" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$VEND_ID" ]; then
  result "PASS" "V-01: Add vendor"
else
  result "FAIL" "V-01: Add vendor" "$VEND"
fi

VE=$(curl -s -b $COOKIE "$BASE/api/vendors/$VEND_ID" -X PUT -H "Content-Type: application/json" -d '{"phone":"9825011111"}')
VP=$(echo "$VE" | python -c "import sys,json; print(json.load(sys.stdin).get('phone',''))" 2>/dev/null)
if [ "$VP" = "9825011111" ]; then
  result "PASS" "V-02: Edit vendor"
else
  result "FAIL" "V-02: Edit vendor" "$VE"
fi

VD=$(curl -s -b $COOKIE "$BASE/api/vendors/$VEND_ID" -X DELETE)
if echo "$VD" | grep -q "success"; then
  result "PASS" "V-03: Delete vendor"
else
  result "FAIL" "V-03: Delete vendor" "$VD"
fi

echo ""
echo ">> 9. PHONE DIRECTORY"

DIR=$(curl -s -b $COOKIE "$BASE/api/directory" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"name\":\"Test RTO Agent\",\"phone\":\"9825077777\",\"category\":\"RTO Agent\"}")
DIR_ID=$(echo "$DIR" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$DIR_ID" ]; then
  result "PASS" "PD-01: Add contact"
else
  result "FAIL" "PD-01: Add contact" "$DIR"
fi

echo ""
echo ">> 10. INSURANCE"

INS=$(curl -s -b $COOKIE "$BASE/api/insurance" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"bus_id\":\"$BUS3_ID\",\"policy_no\":\"NIA-TEST-001\",\"provider\":\"New India\",\"insurance_type\":\"Comprehensive\",\"start_date\":\"2026-04-01\",\"end_date\":\"2027-03-31\",\"premium\":28000}")
INS_ID=$(echo "$INS" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$INS_ID" ]; then
  result "PASS" "I-01: Add insurance (active)"
else
  result "FAIL" "I-01: Add insurance" "$INS"
fi

INS2=$(curl -s -b $COOKIE "$BASE/api/insurance" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"bus_id\":\"$BUS3_ID\",\"policy_no\":\"OLD-001\",\"provider\":\"ICICI\",\"insurance_type\":\"Third Party\",\"start_date\":\"2024-04-01\",\"end_date\":\"2025-03-31\",\"premium\":12000}")
INS2_ID=$(echo "$INS2" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$INS2_ID" ]; then
  result "PASS" "I-02: Add expired insurance"
else
  result "FAIL" "I-02: Add expired insurance" "$INS2"
fi

echo ""
echo ">> 11. MASTERS"

EH=$(curl -s -b $COOKIE "$BASE/api/expense-heads?tenant_id=$TID")
EHC=$(echo "$EH" | python -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$EHC" -ge 7 ] 2>/dev/null; then
  result "PASS" "M-01a: Expense heads seeded ($EHC)"
else
  result "FAIL" "M-01a: Expense heads" "$EHC"
fi

VM=$(curl -s -b $COOKIE "$BASE/api/masters/vehicle-makes?tenant_id=$TID")
VMC=$(echo "$VM" | python -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$VMC" -ge 6 ] 2>/dev/null; then
  result "PASS" "M-01b: Vehicle makes seeded ($VMC)"
else
  result "FAIL" "M-01b: Vehicle makes" "$VMC"
fi

SR=$(curl -s -b $COOKIE "$BASE/api/masters/staff-roles?tenant_id=$TID")
SRC=$(echo "$SR" | python -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$SRC" -ge 4 ] 2>/dev/null; then
  result "PASS" "M-01c: Staff roles seeded ($SRC)"
else
  result "FAIL" "M-01c: Staff roles" "$SRC"
fi

VC=$(curl -s -b $COOKIE "$BASE/api/masters/vendor-categories?tenant_id=$TID")
VCC=$(echo "$VC" | python -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$VCC" -ge 7 ] 2>/dev/null; then
  result "PASS" "M-01d: Vendor categories seeded ($VCC)"
else
  result "FAIL" "M-01d: Vendor categories" "$VCC"
fi

AR=$(curl -s -b $COOKIE "$BASE/api/masters/attendance-rules?tenant_id=$TID")
ARC=$(echo "$AR" | python -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$ARC" -ge 4 ] 2>/dev/null; then
  result "PASS" "M-01e: Attendance rules seeded ($ARC)"
else
  result "FAIL" "M-01e: Attendance rules" "$ARC"
fi

NEW_EH=$(curl -s -b $COOKIE "$BASE/api/expense-heads" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"name\":\"Test Toll\"}")
NEH_ID=$(echo "$NEW_EH" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$NEH_ID" ]; then
  result "PASS" "M-02: Add new master item"
else
  result "FAIL" "M-02: Add master item" "$NEW_EH"
fi

DUP=$(curl -s -b $COOKIE "$BASE/api/expense-heads" -X POST -H "Content-Type: application/json" \
  -d "{\"tenant_id\":\"$TID\",\"name\":\"Test Toll\"}")
if echo "$DUP" | grep -qi "error\|duplicate\|unique\|conflict\|already"; then
  result "PASS" "M-06: Duplicate rejected"
else
  result "FAIL" "M-06: Duplicate prevention" "$DUP"
fi

echo ""
echo ">> 12. LOGOUT"

curl -s -b $COOKIE -c $COOKIE "$BASE/api/auth/logout" -X POST > /dev/null
ME2=$(curl -s -b $COOKIE "$BASE/api/auth/me")
if echo "$ME2" | grep -qi "error\|unauth\|no session"; then
  result "PASS" "A-06: Logout clears session"
else
  result "FAIL" "A-06: Logout" "$ME2"
fi

echo ""
echo "==========================================="
echo "  RESULTS: $PASS passed / $FAIL failed / $TOTAL total"
echo "==========================================="

# Cleanup
curl -s -c $COOKIE "$BASE/api/auth/login" -X POST -H "Content-Type: application/json" -d '{"email":"admin@pompom.com","password":"admin123"}' > /dev/null
curl -s -b $COOKIE "$BASE/api/staff/$STAFF2_ID" -X DELETE > /dev/null
curl -s -b $COOKIE "$BASE/api/buses/$BUS3_ID" -X DELETE > /dev/null
curl -s -b $COOKIE "$BASE/api/insurance/$INS_ID" -X DELETE > /dev/null
curl -s -b $COOKIE "$BASE/api/insurance/$INS2_ID" -X DELETE > /dev/null
if [ -n "$NEH_ID" ]; then
  curl -s -b $COOKIE "$BASE/api/expense-heads/$NEH_ID" -X DELETE > /dev/null
fi
if [ -n "$DIR_ID" ]; then
  curl -s -b $COOKIE "$BASE/api/directory/$DIR_ID" -X DELETE > /dev/null
fi
echo "(Test data cleaned up)"
