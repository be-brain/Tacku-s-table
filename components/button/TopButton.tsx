import React from "react";

const TopButton = ({ className }: any) => {
    const scrollToTop = () => {
        window.scroll({
            top: 0,
            behavior: "smooth",
        });
    };
    return (
        <>
            <button
                type="button"
                onClick={scrollToTop}
                className="bg-brand100 aspect-square p-3 rounded-full text-white fixed bottom-5 right-24 z-50 text-sm"
            >
                Top
            </button>
        </>
    );
};

export default TopButton;
