import expect from '@kbn/expect';

describe('suite', () => {
  it('is a test', () => {
    expect(true).to.equal(true);
  });
});


describe("validResponse", (req, res) => {
  it(res.status === 200, () => {
    expect(true).contain(res.data);
    res.json(`valid test response: ${res.status}`)
  })
})


