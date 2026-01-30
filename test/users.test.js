import { describe, it, } from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';

chai.use(chaiHttp);
chai.should();

describe('signin', () => {
  it('user should be able to signin', (done) => {
    const user = {
      email: 'teejohn247@gmail.com',
      password: 'testest',
    };
    chai.request(app)
      .post('/api/v1/signin')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        // res.body.should.have.property('data');
        done();
      });
  }); 
});
