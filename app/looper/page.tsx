export default function Looper() {
  return (
    <main style={{display: "flex",flex-direction: "column"}}>

      <h1>Looper</h1>
      <Setting style={{width:"100vw",height:"20vh"}} />
    </main>
  );
}

function Setting(bpm:number,count:number,bar:number){
  return (
    <article>
      <ul>
        <li>BPM</li>
        <li>Count</li>
        <li>Bar</li>
      </ul>
    </article>
  );
}
