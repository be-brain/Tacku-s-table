import Image from "next/image";
import RecipeListData from "./RecipeListData";
import logo from "../../public/images/logo2-2.png";
import InfiniteScroll from "react-infinite-scroller";

// 전체레시피불러오기
const RecipeList = ({
    text,
    currentItems,
    totalItems,
    dataResults,
    filteredFood,
    filteredTime,
    isBest,
    fetchNextPage,
    hasNextPage,
}: TypeSearchPageProps) => {
    // dataResults = 검색결과
    // currentItems = 전체레시피(총)
    // totalItems = 전체레시피(6개씩)
    const filteredFoodAndTime = filteredFood?.length && filteredTime?.length;
    const filteredOnlyFood = filteredFood?.length;
    const filteredOnlyTime = filteredTime?.length;

    return (
        <>
            {(text && !dataResults?.length) || currentItems?.length === 0 ? (
                <div className="flex flex-col items-center font-medium text-[#eea546]">
                    <Image
                        src={logo}
                        width={100}
                        height={75}
                        alt="logo_image"
                    />
                    <p className="pt-4">게시물이 존재하지 않습니다</p>
                </div>
            ) : filteredFoodAndTime ? (
                (text ? dataResults! : currentItems!)
                    .filter(
                        (item) =>
                            filteredFood.includes(item.foodCategory!) ||
                            filteredTime.includes(item.cookingTime!)
                    )
                    .map((item) => {
                        return <RecipeListData key={item.id} item={item} />;
                    })
            ) : filteredOnlyFood ? (
                (text ? dataResults! : currentItems!)
                    .filter((item) => filteredFood.includes(item.foodCategory!))
                    .map((item) => {
                        return <RecipeListData key={item.id} item={item} />;
                    })
            ) : filteredOnlyTime ? (
                (text ? dataResults! : currentItems!)
                    .filter((item) => filteredTime.includes(item.cookingTime!))
                    .map((item) => {
                        return <RecipeListData key={item.id} item={item} />;
                    })
            ) : dataResults?.length ? (
                isBest ? (
                    dataResults
                        .sort(
                            (a: TypeRecipe, b: TypeRecipe) =>
                                b.viewCount! - a.viewCount!
                        )
                        .map((item) => {
                            return <RecipeListData key={item.id} item={item} />;
                        })
                ) : (
                    dataResults.map((item) => {
                        return <RecipeListData key={item.id} item={item} />;
                    })
                )
            ) : totalItems?.length ? (
                <InfiniteScroll
                    loadMore={() => fetchNextPage?.()}
                    hasMore={hasNextPage}
                    loader={<div key={0}>Loading ...</div>}
                    className="w-full grid mx-auto sm:mx-0 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-9 relative pb-24"
                >
                    {totalItems.map((item) => {
                        return <RecipeListData key={item.id} item={item} />;
                    })}
                </InfiniteScroll>
            ) : (
                <div className="flex flex-col items-center font-medium text-[#eea546]">
                    <Image
                        src={logo}
                        width={100}
                        height={75}
                        alt="logo_image"
                    />
                    <p className="pt-4">게시물이 존재하지 않습니다</p>
                </div>
            )}
        </>
    );
};

export default RecipeList;
