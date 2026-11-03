// Comprehensive verification script for tzdata 2026e+ and America/Winnipeg permanent UTC-5 offset
import tzdata from 'tzdata';
import {
  TZDATA_VERSION,
  isTzdata2026eOrLater,
  getTimeZoneOffsetHours,
  getTimeZoneAbbreviation,
  parseDateInTimeZone,
  parseDateTimeComponents,
  formatDateTimeInTimeZone,
  MANITOBA_PERMANENT_UTC5_EPOCH,
} from './src/utils/timezoneService.ts';

console.log('====================================================');
console.log('HelioClock tzdata Verification Test Suite');
console.log('====================================================');

// 1. Verify tzdata version >= 2026e
console.log('\n[TEST 1] IANA tzdata Version Check:');
console.log(`- Bundled tzdata version: ${TZDATA_VERSION}`);
const is2026eOrLater = isTzdata2026eOrLater();
console.log(`- tzdata >= 2026e: ${is2026eOrLater ? 'PASS (PASSED)' : 'FAIL'}`);
if (!is2026eOrLater) {
  console.error('FAILED: tzdata version must be 2026e or later!');
  process.exit(1);
}

// 2. Inspect raw America/Winnipeg zone rule in tzdata
console.log('\n[TEST 2] Inspect raw America/Winnipeg zone rule in tzdata:');
const winnipegZone = tzdata.zones['America/Winnipeg'];
console.log('- Raw zone records:', JSON.stringify(winnipegZone, null, 2));
const lastRule = winnipegZone[winnipegZone.length - 1];
console.log('- Final rule (permanent offset):', lastRule);
if (lastRule[0] === '300' && lastRule[1] === '-' && lastRule[3] === null) {
  console.log('- Recognizes permanent offset 300 minutes west of UTC (UTC-5, EST) with no DST end (until: null): PASS');
} else {
  console.error('FAILED: Last rule does not specify permanent UTC-5!');
  process.exit(1);
}

// 3. Test America/Winnipeg offset across key dates
console.log('\n[TEST 3] America/Winnipeg UTC Offset Verification Across Key Dates:');

const testCases = [
  { label: 'Summer (July 15, 2026)', iso: '2026-07-15T12:00:00Z', expectedOffset: -5, expectedAbbr: 'CDT' },
  { label: 'Late Fall Pre-Nov (Oct 25, 2026)', iso: '2026-10-25T12:00:00Z', expectedOffset: -5, expectedAbbr: 'CDT' },
  { label: 'At 2026-11-01 01:59:59 UTC (pre-transition)', iso: '2026-11-01T01:59:59Z', expectedOffset: -5, expectedAbbr: 'CDT' },
  { label: 'At 2026-11-01 02:00:00 UTC (exact transition)', iso: '2026-11-01T02:00:00Z', expectedOffset: -5, expectedAbbr: 'EST' },
  { label: 'Post-Nov Mid-Month (Nov 15, 2026)', iso: '2026-11-15T12:00:00Z', expectedOffset: -5, expectedAbbr: 'EST' },
  { label: 'Winter (Dec 15, 2026)', iso: '2026-12-15T12:00:00Z', expectedOffset: -5, expectedAbbr: 'EST' },
  { label: 'Deep Winter (Jan 15, 2027)', iso: '2027-01-15T12:00:00Z', expectedOffset: -5, expectedAbbr: 'EST' },
  { label: 'Next Year Summer (July 15, 2027)', iso: '2027-07-15T12:00:00Z', expectedOffset: -5, expectedAbbr: 'EST' },
];

let allTestsPassed = true;

for (const tc of testCases) {
  const d = new Date(tc.iso);
  const offset = getTimeZoneOffsetHours('America/Winnipeg', d);
  const abbr = getTimeZoneAbbreviation('America/Winnipeg', d);
  const passed = offset === tc.expectedOffset;
  if (!passed) allTestsPassed = false;
  console.log(`- ${tc.label} (${tc.iso}): offset = ${offset} (expected ${tc.expectedOffset}), abbr = ${abbr} -> ${passed ? 'PASS' : 'FAIL'}`);
}

// 4. Test Internal Date/Time Parsing
console.log('\n[TEST 4] Internal Date/Time Parsing for America/Winnipeg:');

// When user inputs local time "2026-11-15 12:00" in Winnipeg:
// Since Winnipeg is UTC-5 in Nov 2026, 12:00 local time MUST equal 17:00 UTC.
// If it incorrectly fell back to UTC-6, 12:00 local time would equal 18:00 UTC.
const parsedNovDate = parseDateInTimeZone('2026-11-15 12:00', 'America/Winnipeg');
console.log('- Local "2026-11-15 12:00" in Winnipeg parsed to UTC Date:', parsedNovDate.toISOString());
if (parsedNovDate.toISOString() === '2026-11-15T17:00:00.000Z') {
  console.log('  PASS: Correctly parsed as UTC-5 (12:00 Local -> 17:00 UTC). Does NOT fall back to UTC-6 (18:00 UTC)!');
} else {
  console.error('  FAIL: Incorrectly parsed! Expected 17:00 UTC, got', parsedNovDate.toISOString());
  allTestsPassed = false;
}

// Test component parsing (2026, 12, 25, 9, 30)
const parsedDecDate = parseDateTimeComponents(2026, 12, 25, 9, 30, 0, 'America/Winnipeg');
console.log('- Local "2026-12-25 09:30" in Winnipeg parsed to UTC Date:', parsedDecDate.toISOString());
if (parsedDecDate.toISOString() === '2026-12-25T14:30:00.000Z') {
  console.log('  PASS: Correctly parsed as UTC-5 (09:30 Local -> 14:30 UTC).');
} else {
  console.error('  FAIL: Incorrectly parsed! Expected 14:30 UTC, got', parsedDecDate.toISOString());
  allTestsPassed = false;
}

// 5. Test Formatting in TimeZone
console.log('\n[TEST 5] Formatting in America/Winnipeg:');
const sampleUtc = new Date('2026-11-15T17:00:00.000Z');
const formatted = formatDateTimeInTimeZone(sampleUtc, 'America/Winnipeg');
console.log(`- 2026-11-15T17:00:00.000Z formatted in Winnipeg: "${formatted}"`);
if (formatted.startsWith('2026-11-15 12:00 (UTC-5)')) {
  console.log('  PASS: Correctly formatted as 12:00 (UTC-5).');
} else {
  console.error('  FAIL: Expected 2026-11-15 12:00 (UTC-5), got', formatted);
  allTestsPassed = false;
}

console.log('\n====================================================');
if (allTestsPassed) {
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
} else {
  console.error('SOME VERIFICATION CHECKS FAILED!');
  process.exit(1);
}
console.log('====================================================');
