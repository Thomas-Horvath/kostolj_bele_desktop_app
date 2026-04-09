import Link from 'next/link';
import styles from '../styles/sidebar.module.scss';
import { prisma } from '../../lib/prisma';
import { sortTypesByPreferredOrder } from '../../lib/recipeOptions';


const SideBar = async () => {
    const typeList = await prisma.type.findMany();
    const orderedTypes = sortTypesByPreferredOrder(typeList);

    return (
        <div>
            <aside className={styles.aside}>

                {/* category section */}
                <div className={styles.category_container}>
                    <h2>Kategóriák</h2>
                    <ul>
                        <li>
                            <Link href="/receptek" className={styles.links}>Összes</Link>
                        </li>
                        {orderedTypes.map((type) => (
                            <li key={type.id}>
                                <Link href={`/receptek/kategoria/${type.paramName}`} className={styles.links}>{type.name}</Link>
                            </li>
                        ))
                        }
                    </ul>
                </div>



                {/*  Search  */}
                <div className={styles.about_container}>
                    <h2>Keresés</h2>
                    <form action="/receptek" className={styles.form_container}>
                        <input
                            type="text"
                            name="q"
                            placeholder="Keresés név vagy kategória alapján..."
                        />
                        <p className={styles.help_text}>
                            Példa: húsételek, desszertek, levesek
                        </p>
                        <button type="submit" className='btn-orange'>Keresés</button>
                    </form>

                </div>

            </aside>
        </div>
    )
}

export default SideBar
