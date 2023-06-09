import { dbService } from "@/config/firebase";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
} from "firebase/firestore";
import Fuse from "fuse.js";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import RecipeList from "@/components/searchPage/RecipeList";
import ChangeSortedBtn from "@/components/searchPage/ChangeSortedBtn";
import SideFoodCate from "@/components/searchPage/SideFoodCate";
import SideCookingTime from "@/components/searchPage/SideCookingTime";
import TopButton from "@/components/button/TopButton";
import { GrRotateLeft } from "react-icons/gr";
import SearchTextBar from "@/components/searchPage/SearchTextBar";
import Seo from "../../components/layout/Seo";
import { useInfiniteQuery } from "@tanstack/react-query";

const SearchData: NextPage = () => {
    const router = useRouter();
    const deliverKeyword = router.query.keyword;
    const [text, setText] = useState(deliverKeyword?.toString() || "");
    const [isBest, setIsBest] = useState(false);
    const [filteredFood, setFilteredFood] = useState<string[]>([]);
    const [filteredTime, setFilteredTime] = useState<string[]>([]);
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
    // 전체목록(12개씩)
    const first = async () => {
        const querySnapshot = await getDocs(
            query(
                collection(dbService, "recipe"),
                orderBy(isBest ? "viewCount" : "createdAt", "desc"),
                limit(12)
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
                startAfter(pageParam),
                limit(12)
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
            ["infiniteRecipe", isBest],
            async ({ pageParam }) =>
                await (pageParam ? next(pageParam) : first()),
            {
                getNextPageParam: (querySnapshot) => {
                    const lastPageParam =
                        querySnapshot.docs[querySnapshot.docs.length - 1];
                    return querySnapshot.size < 12 ? undefined : lastPageParam;
                },
                refetchOnWindowFocus: false,
            }
        );
    // 전체목록불러오기
    const getList = async () => {
        const items = query(
            collection(dbService, "recipe"),
            orderBy(isBest ? "viewCount" : "createdAt", "desc")
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

    // 카테고리필터링(음식종류)
    const onCheckedFood = useCallback(
        (checked: boolean, newItem: string) => {
            if (checked) {
                sessionStorage.setItem(
                    "filteredFoodData",
                    JSON.stringify([...filteredFood, newItem])
                );
                setFilteredFood([...filteredFood, newItem]);
            } else if (!checked) {
                sessionStorage.setItem(
                    "filteredFoodData",
                    JSON.stringify(
                        filteredFood.filter((ele) => ele !== newItem)
                    )
                );
                setFilteredFood(filteredFood.filter((ele) => ele !== newItem));
            }
        },
        [filteredFood]
    );
    // 카테고리필터링(조리시간)
    const onCheckedTime = useCallback(
        (checked: boolean, newItem: string) => {
            if (checked) {
                sessionStorage.setItem(
                    "filteredTimeData",
                    JSON.stringify([...filteredTime, newItem])
                );
                setFilteredTime([...filteredTime, newItem]);
            } else if (!checked) {
                sessionStorage.setItem(
                    "filteredTimeData",
                    JSON.stringify(
                        filteredTime.filter((ele) => ele !== newItem)
                    )
                );
                setFilteredTime(filteredTime.filter((ele) => ele !== newItem));
            }
        },
        [filteredTime]
    );
    // 체크박스 리셋
    const clearChecked = () => {
        setFilteredFood([]);
        setFilteredTime([]);
        sessionStorage.removeItem("filteredFoodData");
        sessionStorage.removeItem("filteredTimeData");
    };

    useEffect(() => {
        const result = sessionStorage.getItem("userWatching");
        const storeSearchText = sessionStorage.getItem("searchData");
        const storeFilteredFood = JSON.parse(
            sessionStorage.getItem("filteredFoodData")!
        );
        const storeFilteredTime = JSON.parse(
            sessionStorage.getItem("filteredTimeData")!
        );
        if (result === "viewCount") {
            setIsBest(true);
        } else {
            setIsBest(false);
        }
        storeSearchText && setText(storeSearchText);
        !storeSearchText && setText("");
        storeFilteredFood && setFilteredFood(storeFilteredFood);
        storeFilteredTime && setFilteredTime(storeFilteredTime);
        getList();
    }, [isBest]);

    if (isLoading) {
        return <span>Loading...</span>;
    }
    if (isError) {
        return <span>Error : {error.message}</span>;
    }

    return (
        <>
            <div className="w-full flex flex-col justify-center items-center">
                <Seo title="타쿠의 식탁" />
                <TopButton />
                <SearchTextBar setText={setText} />
                <ChangeSortedBtn
                    text={text}
                    currentItems={currentItems}
                    dataResults={dataResults}
                    isBest={isBest}
                    activeBestBtn={activeBestBtn}
                    inactiveBestBtn={inactiveBestBtn}
                    filteredFood={filteredFood}
                    filteredTime={filteredTime}
                />
                <div className="w-4/5 border-b border-mono70 mb-8"></div>
                <div className="w-4/5 flex flex-col items-center md:items-start md:flex-row md:justify-between mb-10">
                    <div className="w-full md:w-[150px] flex flex-col justify-center items-center gap-x-4 mx-auto mb-9 md:justify-start md:ml-1 md:mr-3">
                        <div className="w-full flex justify-between sm:justify-center sm:gap-x-10 md:flex-col">
                            <SideFoodCate
                                onCheckedFood={onCheckedFood}
                                filteredFood={filteredFood}
                            />
                            <SideCookingTime
                                onCheckedTime={onCheckedTime}
                                filteredTime={filteredTime}
                            />
                        </div>
                        <button
                            onClick={clearChecked}
                            type="button"
                            className="sorted-btn mt-4 md:mt-7 md:self-start"
                        >
                            선택초기화<GrRotateLeft></GrRotateLeft>
                        </button>
                    </div>
                    <div className="w-full">
                        <RecipeList
                            text={text}
                            currentItems={currentItems}
                            totalItems={totalItems}
                            dataResults={dataResults}
                            filteredFood={filteredFood}
                            filteredTime={filteredTime}
                            isBest={isBest}
                            fetchNextPage={fetchNextPage}
                            hasNextPage={hasNextPage}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchData;
