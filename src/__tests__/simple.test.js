// Test simple pour vérifier que Jest fonctionne
test('addition simple', () => {
  expect(1 + 1).toBe(2);
});

test('objet égalité', () => {
  const data = {one: 1};
  data['two'] = 2;
  expect(data).toEqual({one: 1, two: 2});
});

test('valeur nulle', () => {
  const n = null;
  expect(n).toBeNull();
  expect(n).toBeDefined();
  expect(n).not.toBeUndefined();
  expect(n).not.toBeTruthy();
  expect(n).toBeFalsy();
});