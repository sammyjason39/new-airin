import { team } from "./landing-content";
import { WaitlistForm } from "./landing-waitlist";

function WaitlistSection() {
  return (
    <section
      aria-labelledby="waitlist-title"
      className="landing-waitlist"
      id="daftar-tunggu"
    >
      <div className="landing-wrap landing-waitlist-layout">
        <div data-reveal="rise">
          <h2 id="waitlist-title">
            Mau bisnisnya kecil atau besar.
            <br />
            <em>Mimpinya harus besar.</em>
          </h2>
          <p className="landing-waitlist-lead">Superteam. Siap bantu kamu.</p>
          <p>
            Kami masih di tahap early limited testing untuk beberapa bisnis. Isi
            form ini — kami akan hubungi kamu secepatnya. Beberapa akan kami
            pilih sebagai Founding Member Users, untuk merasakan duluan
            kehebatan Superteam ini.
          </p>
          <div aria-hidden className="landing-waitlist-team">
            {team.map((member) => (
              <img
                alt=""
                height={130}
                key={member.avatar}
                loading="lazy"
                src={`/characters/${member.avatar}.png`}
                width={130}
              />
            ))}
          </div>
        </div>
        <WaitlistForm />
      </div>
    </section>
  );
}

export { WaitlistSection };
