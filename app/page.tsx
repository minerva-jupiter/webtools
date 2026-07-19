import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Webtools</h1>
      <h4>by Minerva_Juppiter</h4>
      <br />
      <ul>
        <li>
          <Link href="/password">Password Generator</Link>
        </li>
        <li>
          <Link href="/time-translate">Time Translate</Link>
        </li>
        <li>
          <Link href="/audio-analysis">Audio Analysis</Link>
        </li>
        <li>
          <Link href="/char-count">Count Characters</Link>
        </li>
        <li>
          <Link href="/nfc">NFC Scanner</Link>
        </li>
      </ul>
    </main>
  );
}
