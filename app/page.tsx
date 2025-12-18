import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Webtools</h1>
      <h4>by Minerva_Juppiter</h4>
      <br />
      <ul>
        <li>
          <Link href="/password">Password Generator</Link>
        </li>
        <li>
          <Link href="/looper">Looper</Link>
        </li>
        <li>
          <Link href="/oilart">Oil Art Generator</Link>
        </li>
      </ul>
    </main>
  );
}
