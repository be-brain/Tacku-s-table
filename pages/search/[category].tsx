import { dbService } from "@/config/firebase";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    where,
} from "firebase/firestore";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import RecipeList from "@/components/searchPage/RecipeList";
import ChangeSortedBtn from "@/components/searchPage/ChangeSortedBtn";
import SearchTextBar from "@/components/searchPage/SearchTextBar";
import Seo from "../../components/layout/Seo";
import { useInfiniteQuery } from "@tanstack/react-query";

// 카테고리별 불러오기
const ClassifiedRecipe: NextPage = () => {
    const router = useRouter();
    const [text, setText] = useState("");
    const [isBest, setIsBest] = useState(false);
    const [currentItems, setCurrentItems] = useState<TypeRecipe[]>([]);
    const [totalItems, setTotalItems] = useState<TypeRecipe[]>([]);

    // 인기순
    const activeBestBtn = () => {
        sessionStorage.setItem("userWatching", "viewCount");
        setIsBest(true);
    };

    // 최신순
    const inactiveBestBtn = () => {
        sessionStorage.setItem("userWatching", "createdAt");
        setIsBest(false);
    };
    // 전체목록(6개씩)
    const first = async () => {
        const querySnapshot = await getDocs(
            query(
                collection(dbService, "recipe"),
                orderBy(isBest ? "viewCount" : "createdAt", "desc"),
                where(
                    `${
                        router.query.category === "15분이하" ||
                        router.query.category === "30분이하" ||
                        router.query.category === "1시간이하" ||
                        router.query.category === "1시간이상"
                            ? "cookingTime"
                            : "foodCategory"
                    }`,
                    "==",
                    `${router.query.category}`
                ),
                limit(6)
            )
        );
        const newData = querySnapshot.docs.map((doc: any) => ({
            ...doc.data(),
            id: doc.id,
        }));
        setTotalItems(newData);
        return querySnapshot;
    };
    // 더보기event
    const next = async (pageParam: number) => {
        const querySnapshot = await getDocs(
            query(
                collection(dbService, "recipe"),
                orderBy(isBest ? "viewCount" : "createdAt", "desc"),
                where(
                    `${
                        router.query.category === "15분이하" ||
                        router.query.category === "30분이하" ||
                        router.query.category === "1시간이하" ||
                        router.query.category === "1시간이상"
                            ? "cookingTime"
                            : "foodCategory"
                    }`,
                    "==",
                    `${router.query.category}`
                ),
                startAfter(pageParam),
                limit(6)
            )
        );
        const newData = querySnapshot.docs.map((doc: any) => ({
            ...doc.data(),
            id: doc.id,
        }));
        setTotalItems((prev) => [...prev, ...newData]);
        return querySnapshot;
    };
    // InfiniteQuery
    const { isLoading, isError, error, fetchNextPage, hasNextPage } =
        useInfiniteQuery<any, Error>(
            ["infiniteClassifiedRecipe", isBest],
            async ({ pageParam }) =>
                await (pageParam ? next(pageParam) : first()),
            {
                getNextPageParam: (querySnapshot) => {
                    const lastPageParam =
                        querySnapshot.docs[querySnapshot.docs.length - 1];
                    return querySnapshot.size < 6 ? undefined : lastPageParam;
                },
                refetchOnWindowFocus: false,
            }
        );

    // 목록불러오기
    const getList = async () => {
        const items = query(
            collection(dbService, "recipe"),
            orderBy(isBest ? "viewCount" : "createdAt", "desc"),
            where(
                `${
                    router.query.category === "15분이하" ||
                    router.query.category === "30분이하" ||
                    router.query.category === "1시간이하" ||
                    router.query.category === "1시간이상"
                        ? "cookingTime"
                        : "foodCategory"
                }`,
                "==",
                `${router.query.category}`
            )
        );
        const querySnapshot = await getDocs(items);
        const newData = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));
        setCurrentItems(newData);
    };

    // 검색
    const fuse = new Fuse(currentItems, {
        keys: [
            {
                name: "foodTitle",
                weight: 0.5,
            },
            {
                name: "animationTitle",
                weight: 0.3,
            },
            {
                name: "cookingTime",
                weight: 0.2,
            },
        ],
        includeScore: true,
        threshold: 0.5, //일치정도(0~1.0)
        minMatchCharLength: text.length,
    });
    const results = fuse.search(text);
    const dataResults = results.map((recipe) => recipe.item);

    useEffect(() => {
        const result = sessionStorage.getItem("userWatching");
        const storeSearchText = sessionStorage.getItem("searchData");
        if (result === "viewCount") {
            setIsBest(true);
        } else {
            setIsBest(false);
        }
        storeSearchText && setText(storeSearchText);
        !storeSearchText && setText("");
        getList();
    }, [router.query.category, isBest]);

    if (isLoading) {
        return <span>Loading...</span>;
    }

    if (isError) {
        return <span>Error : {error.message}</span>;
    }

    return (
        <div className="w-full flex flex-col justify-center items-center">
            <Seo title="타쿠의 식탁" />
            <SearchTextBar setText={setText} />
            <ChangeSortedBtn
                text={text}
                dataResults={dataResults}
                currentItems={currentItems}
                isBest={isBest}
                activeBestBtn={activeBestBtn}
                inactiveBestBtn={inactiveBestBtn}
            />
            <div className="w-4/5 border-b border-mono50 mb-8"></div>
            <div className="w-4/5 md:flex md:justify-between mb-10">
                <div className="bg-mono30 rounded-sm w-full md:w-1/5 h-9 px-6 mr-7 mb-7 flex justify-center items-center text-sm text-brand100">
                    {router.query.category?.toString().replaceAll("&", "/")}
                </div>
                <div className="w-full">
                    <RecipeList
                        text={text}
                        currentItems={currentItems}
                        totalItems={totalItems}
                        dataResults={dataResults}
                        isBest={isBest}
                        fetchNextPage={fetchNextPage}
                        hasNextPage={hasNextPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClassifiedRecipe;
