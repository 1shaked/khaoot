import { useParams } from "react-router-dom";

export function TornomentDetails() {
    // get the id from the url
    const { id } = useParams();


    return <main>

        <h1>{id}</h1>
    </main>
}