import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { setTimeout } from "timers";

const Slider: NextPage = () => {
    const [index, setIndex] = useState(0);
    const cards = [
        {
            id: "1",
            text: "#하울의 움직이는 성 #센과 치히로의 행방불명 #마루 밑의 아리에티",
        },
        { id: "2", text: "#시간을 달리는 소녀 #늑대아이 #썸머 워즈" },
        { id: "3", text: "#언어의 정원 #너의 이름은 #날씨의 아이" },
    ];
    const mod = (n: number, m: number) => {
        const result = n % m; //반환하는값이 양수인지 확인
        return result >= 0 ? result : result + m;
    };

    useEffect(() => {
        setTimeout(() => {
            setIndex((index + 1) % cards.length);
        }, 4000);
    }, [index]);

    return (
        <div className="w-full text-center h-7 relative overflow-hidden mb-20">
            {cards.map((item, i) => {
                const indexTop = mod(index - 1, cards.length);
                const indexBottom = mod(index + 1, cards.length);

                let classN = "";
                switch (i) {
                    case index:
                        classN = "card";
                        break;
                    case indexTop:
                        classN =
                            "card transform -translate-y-28 transition-all";
                        break;
                    case indexBottom:
                        classN = "card transform translate-y-28 transition-all";
                }
                return (
                    <div key={item.id} className={classN}>
                        {item.text}
                    </div>
                );
            })}
        </div>
    );
};

export default Slider;
