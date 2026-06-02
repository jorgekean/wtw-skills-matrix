export const MatrixLoadingOverlay = () => {
    return (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl m-6">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-[#622F88] rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Fetching Dataverse Matrix...</p>
        </div>
    );
};
