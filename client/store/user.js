import { make } from 'vuex-pathify'
import jwt from 'jsonwebtoken'
import Cookies from 'js-cookie'

const state = {
  id: 0,
  email: '',
  name: '',
  pictureUrl: '',
  localeCode: '',
  defaultEditor: '',
  timezone: '',
  dateFormat: '',
  appearance: '',
  permissions: [],
  iat: 0,
  exp: 0,
  authenticated: false,
  disableEditorSelector: true
  // settings: {
  //  }
}

export default {
  namespaced: true,
  state,
  mutations: {
    ...make.mutations(state),
    REFRESH_AUTH(st) {
      const jwtCookie = Cookies.get('jwt')
      if (jwtCookie) {
        try {
          const jwtData = jwt.decode(jwtCookie)
          st.id = jwtData.id
          st.email = jwtData.email
          st.name = jwtData.name
          st.pictureUrl = jwtData.av
          st.localeCode = jwtData.lc
          st.timezone = jwtData.tz || Intl.DateTimeFormat().resolvedOptions().timeZone || ''
          st.dateFormat = jwtData.df || ''
          st.appearance = jwtData.ap || ''
          // st.defaultEditor = jwtData.defaultEditor
          st.permissions = jwtData.permissions
          st.iat = jwtData.iat
          st.exp = jwtData.exp
          // st.disableEditorSelector = jwtData.disableEditorSelector
          st.authenticated = true

          // Fixme: multi-user -> save in db
          let profileCookie = Cookies.get('WikijsProfileSettings')
          if (profileCookie !== undefined) {
            profileCookie = JSON.parse(profileCookie)
            // console.log('profileCookie', typeof(profileCookie), profileCookie)
            st.disableEditorSelector = profileCookie.disableEditorSelector
            console.log('disableEditorSelector', st.disableEditorSelector)
          }
        } catch (err) {
          console.debug('Invalid JWT. Silent authentication skipped.')
          // console.debug(err)
        }
      }
    }
  }
}
