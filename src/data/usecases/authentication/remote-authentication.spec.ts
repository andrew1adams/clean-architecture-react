import { HttpPostClientSpy } from '../../test';
import { RemoteAuthentication } from './remote-authentication';

describe('Remote Authentication', () => {
  test('Should call HttpPostClient with correct URL', async () => {
    const url = 'any_url';
    const httpPostClientSpy = new HttpPostClientSpy();
    const sut = new RemoteAuthentication(url, httpPostClientSpy);
    await sut.auth();
    expect(httpPostClientSpy.url).toBe(url);
  });
});
