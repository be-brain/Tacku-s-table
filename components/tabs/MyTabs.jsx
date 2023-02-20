import { Tab } from "@headlessui/react";
import { authService, dbService } from "@/config/firebase";

import {
  collection,
  docs,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
// interface MyTabsProps {
//   userInfo: any;
//   setUserInfo: any;
// }
const MyTabs = ({ userInfo, setUserInfo }) => {
  const [recipePost, setRecipePost] = useState([]);
  const [communityPost, setCommunityPost] = useState([]);
  const [commentPost, setCommentPost] = useState([]);
  const userId = userInfo.userId;
  // const currentUser = JSON.parse(sessionStorage.getItem("User")) || "";

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  let [categories] = useState([
    "즐겨찾기",
    "내가 쓴 레시피",
    "내가 쓴 커뮤니티글",
    "내가 쓴 커뮤니티 댓글",
  ]);
  useEffect(() => {
    const currentUser = JSON.parse(sessionStorage.getItem("User")) || "";
    getMyCommunityPost(userId);
    getMyRecipePost(userId);
    getCommunityComment(userId);
  });
  // 즐겨찾기

  // 내가 쓴 레시피
  const getMyRecipePost = async (userId) => {
    const recipeRef = collection(dbService, "recipe");
    const q = query(recipeRef, where("uid", "==", `${userId}`));
    onSnapshot(q, (snapshot) => {
      const myposts = snapshot.docs.map((doc) => {
        const mypost = {
          postId: doc.id,
          ...doc.data(),
        };
        // console.log(doc.id, " => ", doc.data());
        return mypost;
      });
      setRecipePost(myposts);
    });
  };

  // 커뮤니티 게시글
  const getMyCommunityPost = async (userId) => {
    const communityRef = collection(dbService, "communityPost");
    const q = query(communityRef, where("uid", "==", `${userId}`));
    onSnapshot(q, (snapshot) => {
      const myposts = snapshot.docs.map((doc) => {
        const mypost = {
          postId: doc.id,
          ...doc.data(),
        };
        // console.log(doc.id, " => ", doc.data());
        return mypost;
      });
      setCommunityPost(myposts);
    });
  };

  // 커뮤니티 댓글
  const getCommunityComment = async (userId) => {
    const commentsRef = collection(dbService, "comments");
    const q = query(commentsRef, where("uid", "==", `${userId}`));
    onSnapshot(q, (snapshot) => {
      const myposts = snapshot.docs.map((doc) => {
        const mypost = {
          postId: doc.id,
          boardId: doc.data().boardId,
          comment: doc.data().comment,
        };
        // console.log(doc.id, " => ", doc.data());
        return mypost;
      });
      setCommentPost(myposts);
    });
  };

  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl  bg-orange-400">
        {categories.map((category) => (
          <Tab
            key={category}
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-orange-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white shadow text-orange-400"
                  : "text-slate-200 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            {category}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>즐겨찾기 컨텐츠</Tab.Panel>
        <Tab.Panel>
          {recipePost?.map((p) => (
            <div key={p.postId}>
              <Link legacyBehavior href={`/detailRecipePage/${p.postId}`}>
                <a>{p.foodTitle}</a>
              </Link>
            </div>
          ))}
        </Tab.Panel>
        <Tab.Panel>
          {communityPost?.map((p) => (
            <div key={p.postId}>
              <Link legacyBehavior href={`/communityPage/${p.postId}`}>
                <a>{p.title}</a>
              </Link>
            </div>
          ))}
        </Tab.Panel>
        <Tab.Panel>
          {commentPost?.map((p) => (
            <div key={p.postId}>
              <Link legacyBehavior href={`/communityPage/${p.boardId}`}>
                <a>{p.comment}</a>
              </Link>
            </div>
          ))}
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default MyTabs;