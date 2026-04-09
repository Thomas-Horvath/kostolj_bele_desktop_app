
import RecipeCard from '../../../../../components/RecipeCard';
import { prisma } from '../../../../../../lib/prisma';
import styles from '../../../../../styles/recipes.module.scss'
import { notFound } from 'next/navigation';

const Category = async ({ params }) => {
    const resolvedParams = await params;
    const typeName = resolvedParams.type;

    const name = await prisma.type.findUnique({
        where: {
            paramName: typeName,
        }
    });

    if (!name) {
        notFound();
    }

    const filteredRecipes = await prisma.recipe.findMany(
        {
            where: {
                type: {
                    paramName: typeName,   // pl. "Desszert"
                },
            },
            include: {
                type: {
                    select: {
                        id: true,
                        name: true,
                        paramName: true,
                    }
                }
            },
            orderBy: {
                name: "asc",
            },

        }
    );

    return (
        <div className={styles.container}>

            <div className={styles.main_container}>
                <h1 className={styles.main_title}>Kategória: {name.name}</h1>
                <div className={styles.card_container}>


                    {filteredRecipes.length === 0 ? <p>Még nincs étel a kategóriában!</p> :
                        filteredRecipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))
                    }</div>
            </div>

        </div>
    )
}

export default Category
