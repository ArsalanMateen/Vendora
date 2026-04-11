const auth = {
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    if (sessionStorage.getItem('jwt')) {
      return JSON.parse(sessionStorage.getItem('jwt'));
    }
    if (localStorage.getItem('jwt')) {
      return JSON.parse(localStorage.getItem('jwt'));
    }

    return false;
  },
  authenticate(jwt, cb) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('jwt', JSON.stringify(jwt));
      localStorage.setItem('jwt', JSON.stringify(jwt));
    }
    if (cb) cb();
  },
  clearJWT(cb) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('jwt');
      localStorage.removeItem('jwt');
    }
    if (cb) cb();
    fetch('/auth/signout', { method: 'GET' }).catch(() => {});
  },
  updateUser(user, cb) {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('jwt')) {
        let auth = JSON.parse(sessionStorage.getItem('jwt'));
        auth.user = user;
        sessionStorage.setItem('jwt', JSON.stringify(auth));
      }
      if (localStorage.getItem('jwt')) {
        let auth = JSON.parse(localStorage.getItem('jwt'));
        auth.user = user;
        localStorage.setItem('jwt', JSON.stringify(auth));
      }
    }
    if (cb) cb();
  },
};

export default auth;
