import Image from 'next/image';
import styles from './styles/home.module.scss';
import HomeRecipesContainer from './components/HomeRecipesContainer';


export default async function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.img_container}>
        <Image
          className={styles.banner_img}
          src="/banner6.webp"
          alt="Banner kép"    // Kép leírása
          width={2200}        // Kép szélessége pixelben
          height={400}
          sizes="100vw"
          priority
        />
        <div className={styles.text_wrapper}>
          <div className={styles.text_container}>
            <h1>Receptek</h1>
            <p>Főzz, kóstolj, alkoss!</p>
          </div>
        </div>
      </div>




      <div className={styles.content}>

        {/* <SideBar /> */}
        <div className={styles.main_container}>

          <h2 className={styles.main_title}>Legjobb receptek</h2>
            <HomeRecipesContainer />
        </div>
      </div>


      <div className={styles.subscribtion}>

        <h3>Iratkozz fel hírlevelünkre!</h3>
        <h4>
          Legyél naprakész a legújabb receptjeinkkel, konyhai tippekkel és inspiráló ötletekkel!
        </h4>


        <div className={styles.form_container}>
          <form action="" >
            <div className={styles.input_content}>
              <input className={styles.input} type="text" placeholder="Neved" />
              <input className={styles.input} type="text" placeholder="E-mail címed." />
              <button className={`${styles.subscribe_btn} btn-green-border`} >Feliratkozás!</button>
            </div>


            <label htmlFor="checkbox" className={styles.checkbox_container}>
              <input className={styles.checkbox} id="checkbox" type="checkbox" />
              <div className={styles.custom_checkbox}></div>
              A gombra kattintva elfogadom a személyes adataim kezelését az Adatvédelmi tájékoztatóban leírtaknak megfelelően.
            </label>

          </form>
        </div>


      </div>

    </div>
  );

}
