import { useParams } from 'react-router-dom';

export default function BingoDetailPage() {
    const params = useParams();

    console.log("DebugBingoDetailPage rendering. Params:", params);

    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold">Debug Page</h1>
            <p>ID: {params.id}</p>
        </div>
    );
}
