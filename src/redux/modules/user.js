import { createAction, handleActions } from "redux-actions";
import produce from "immer";
import { deleteCookie, setCookie } from "../../shared/Cookie";
import { apis } from "../../shared/Api";

// action
const LOGIN = "user/LOGIN";
const LOGOUT = "user/LOGOUT";

// action creator
const setLogin = createAction(LOGIN, (user) => ({ user }));
const logOut = createAction(LOGOUT, (user) => ({ user }));

// initialState
const initialState = {
  nickaname: "suin",
  // username: null,
  // email: null,
  is_login: true,
  response: null, //닉네임 중복 확인
};

// Thunk function
//---- 회원가입 DB ----
const signUpDB = (id, email, pwd) => {
  return function (dispatch, getState, { history }) {
    apis
      .signup(id, email, pwd)
      .then(function (response) {
        //회원가입 확인
        console.log(response);
      })
      .catch(function (error) {
        //회원가입 에러
        console.log(error);
      });
  };
};
//---- 회원가입 아이디 확인  DB ----
const signUpIdCheckDB = (id) => {
  return function (dispatch, getState, { history }) {
    apis
      .signupId(id)
      .then(function (response) {
        //회원가입 확인
        //response: true or false;
        console.log(response);
      })
      .catch(function (error) {
        //회원가입 에러
        console.log(error);
      });
  };
};
//---- 로그인  DB ----
const setLoginDB = (id, pwd) => {
  return function (dispatch, getState, { history }) {
    apis
      .login(id, pwd)
      .then((res) => {
        setCookie("token", res.data[1].token, 7);
        // localStorage.setItem("username", res.data[0].username);
        dispatch(setLogin({ nickaname: id }));
        history.replace("/");
      })
      .catch((err) => {
        window.alert("없는 회원정보 입니다! 회원가입을 해주세요!");
        //빨간색 표시 알림
      });
  };
};
//---- 로그아웃 DB ----
const logOutDB = () => {
  return function (dispatch, getState, { history }) {
    apis.logout().then((res) => {
      deleteCookie("token");
      localStorage.removeItem("username");
      dispatch(logOut());
      history.replace("/login");
    });
  };
};

// const loginCheckDB = () => {
//   return function (dispatch, getState, { history }) {
//     // const userId = localStorage.getItem("username");
//     const tokenCheck = document.cookie;
//     if (tokenCheck) {
//       dispatch(setLogin({ id: userId }));
//     } else {
//       dispatch(logOut());
//     }
//   };
// };

// reducer
export default handleActions(
  {
    [LOGIN]: (state, action) =>
      produce(state, (draft) => {
        draft.user = action.payload.user;
        draft.is_login = true;
      }),
    [LOGOUT]: (state, action) =>
      produce(state, (draft) => {
        draft.user = null;
        draft.is_login = false;
      }),
  },
  initialState
);

const userCreators = {
  setLoginDB,
  signUpDB,
  logOutDB,
  signUpIdCheckDB,
  // loginCheckDB,
};

export { userCreators };
