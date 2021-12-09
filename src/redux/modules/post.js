import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { apis } from "../../shared/Api";
import "moment";

import { ActionCreators as imageActions } from "./image";
import { Sync } from "@mui/icons-material";

import api from "../../api/posts";
// ---- actions type ----
const GET_POST = "GET_POST";
const ADD_POST = "ADD_POST";
const EDIT_POST = "EDIT_POST";
const LOADING = "LOADING";
// const DELETE_POST = "DELETE_POST";

// ---- action creators ----
const getPost = createAction(GET_POST, (post_list, paging) => ({
  post_list,
  paging,
}));
const addPost = createAction(ADD_POST, (post) => ({
  post,
}));

const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));
// const deletePost = createAction(DELETE_POST, (post_id) => ({ post_id }));

// ---- initialState ----
const initialState = {
  list: [
    // {
    //   post_id: 0,
    //   location: "경기도",
    //   content: "넘모 좋아요",
    //   image_url:
    //     "https://dimg.donga.com/wps/NEWS/IMAGE/2021/09/13/109219735.1.jpg",
    //   nickname: "김차박",
    //   createdAt: "2021-12-06",
    // },
    // {
    //   post_id: 1,
    //   location: "화성1",
    //   content: "넘모오 좋아요",
    //   image_url: "https://dimg.donga.com/wps/NEWS/IMAGE/2021/09/13/109219735.1.jpg",
    //   nickname: "김차박1",
    //   createdAt: "2021-12-06",
    // },
    // {
    //   post_id: 2,
    //   location: "화성2",
    //   content: "넘모오오 좋아요",
    //   image_url: "https://dimg.donga.com/wps/NEWS/IMAGE/2021/09/13/109219735.1.jpg",
    //   nickname: "김차박2",
    //   createdAt: "2021-12-06",
    // },
  ],
  paging: { start: null, next: null, size: 3 },
  is_loading: false,
};

const initialPost = {
  id: 1,
  location: "",
  image_url: null,
  content: "",
  nickname: "",
};

// ---- middleware actions ----
// const fatchPosts = async (dispatch, getState) => {
//   try {
//     const response = await api.get("/list");
//     // console.log(response);
//     // console.log(response.data);
//     const post_list = response.data;
//     dispatch(getPost(post_list));
//     // setPosts(response.data);
//     // console.log(posts);
//   } catch (err) {
//     // if (err.response) {
//     //   //Not in the 200 response range
//     //   console.log(err.response.data);
//     //   console.log(err.response.status);
//     //   console.log(err.response.headers);
//     // } else {
//     //   console.log(`Error:${err.response.data}`);
//     // }
//   }
// };

//-- getPostDB(DB 데이터 가져오기) --

// 로드;
export const getPostDB =
  () =>
  async (dispatch, getState, { history }) => {
    try {
      const { post_list } = await apis.boards();
      console.log(post_list);
      dispatch(getPost(post_list));
    } catch (err) {
      console.log(`boards 조회 오류 발생!${err}`);
    }
  };

//-- deletePostFB(post 삭제)  --
export const deletePostDB =
  (id) =>
  async (dispatch, getState, { history }) => {
    try {
      await apis.del(id);
      history.replace("/");
    } catch (err) {
      console.error("Error removing document: ", err);
    }
  };

//-- addPostDB --

export const addPostDB =
  (_content, _location, formData) =>
  async (dispatch, getState, { history }) => {
    try {
      console.log(formData);
      const user_id = getState().user.nickname;
      const image_url = getState().image.preview;
      const multipartFile = formData.get("img");

      const _post = {
        ...initialPost,
        content: _content,
        location: _location,
        nickname: user_id,
        image_url: image_url,
      };

      const { content, location, nickname } = _post;

      await apis.add(location, content, multipartFile, nickname);
      console.log("yes");

      dispatch(addPost(_post));

      history.push("/");
      dispatch(imageActions.setPreview(null));
    } catch (err) {
      console.error("게시물 업로드 문제 발생", err);
    }
  };

//-- editPostDB --

export const editPostDB =
  (post_id = null, content = {}, location, formData) =>
  async (dispatch, getState, { history }) => {
    try {
      if (!post_id) {
        console.log("게시물 정보가 없어요!");
        return;
      }
      console.log(post_id);
      const multipartFile = formData;
      const image_url = getState().image.preview;

      const post_idx = getState().post.list.findIndex(
        (p) => p.id === Number(post_id)
      );

      const post = getState().post.list[post_idx];
      if (image_url === post.image_url && location === post.location) {
        // await apis.add(post.location, content, post_id);

        dispatch(editPost(post_id, { ...content }));
      } else {
        // await apis.eidt(post.location, content, multipartFile, post_id)
        dispatch(
          editPost(post_id, { ...content, ...location, image_url: image_url })
        );
      }

      history.replace("/");
      dispatch(imageActions.setPreview(null));
    } catch (err) {
      window.alert("이미지를 선택해주세요");
      console.log(err);
    }
  };

//---- reducer ----
export default handleActions(
  {
    [GET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.push(...action.payload.post_list);
        draft.paging = action.payload.paging;
        draft.is_loading = false;
      }),

    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),

    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex(
          (p) => p.id === Number(action.payload.post_id)
        );

        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
      }),

    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      }),
    // [DELETE_POST]: (state, action) =>
    //   produce(state, (draft) => {
    //     let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);
    //     draft.list.splice(idx, 1);
    //   }),
  },
  initialState
);

const actionCreators = {
  getPost,
  getPostDB,
  addPostDB,
  editPostDB,
  deletePostDB,
  // fatchPosts,
};

export { actionCreators };
