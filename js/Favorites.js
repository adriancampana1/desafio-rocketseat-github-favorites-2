import { GithubUser } from './GithubUser.js';

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();
    }

    load() {
        this.entries =
            JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    }

    save() {
        localStorage.setItem(
            '@github-favorites:',
            JSON.stringify(this.entries)
        );
    }

    async add(username) {
        /* tente realizar a ação: */
        try {
            const userExists = this.entries.find(
                (entry) => entry.login === username
            );

            if (userExists) {
                throw new Error('Usuário já cadastrado');
            }

            const user = await GithubUser.search(username);

            if (user.login === undefined) {
                /* throw = arremessar, jogar, lançar */
                /* jogue um erro. Esse erro vai ser mostrado no CATCH */
                throw new Error('Usuário não encontrado!');
            }

            this.entries = [user, ...this.entries];
            this.update();
            this.save();
        } catch (error) {
            alert(error.message);
            /* se alguma coisa der errado, entra no catch */
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(
            (entry) => entry.login !== user.login
        );
        this.entries = filteredEntries;
        this.update();
        this.save();
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('table tbody');

        this.update();
        this.onadd();
    }

    onadd() {
        const addButton = this.root.querySelector('.search button');
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input');

            this.add(value);
        };
    }

    update() {
        this.removeAllTr();

        console.log(this.entries);

        // SE a entrada de dados for IGUAL a 0, mostra a página de 'vazio'
        if (this.entries.length == 0) {
            const row = this.voidPage();

            this.tbody.append(row);
        } else {
            // SE NÃO estiver vazio, ou seja, receber alguma entrada de dados,
            // mostra a página padrão dos favoritos
            this.entries.forEach((user) => {
                const row = this.createRow();
                row.querySelector(
                    '.user img'
                ).src = `https://github.com/${user.login}.png`;

                row.querySelector('.user img').alt = `imagem de ${user.name}`;
                row.querySelector(
                    '.user a'
                ).href = `https://github.com/${user.login}`;
                row.querySelector('.user p').textContent = user.name;
                row.querySelector('.user span').textContent = user.login;
                row.querySelector('.repositories').textContent =
                    user.public_repos;
                row.querySelector('.followers').textContent = user.followers;

                row.querySelector('.remove').onclick = () => {
                    const isOk = confirm(
                        'Tem certeza que deseja deletar esta linha?'
                    );

                    if (isOk) {
                        this.delete(user);
                    }
                };

                this.tbody.append(row);
            });
        }
    }

    voidPage() {
        const trA = document.createElement('tr');

        trA.innerHTML = `
            <tr>
                <td colspan="4" class="vazio">
                    <img src="./assets/estrelinha.svg" alt="" />
                    <h1>Nenhum usuário favoritado ainda :/</h1>
                </td>
            </tr>
        `;

        return trA;
    }

    createRow() {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="user">
                <img
                    src="https://github.com/adriancampana1.png"
                    alt="imagem de adrian campana"
                />
                <a
                    href="https://github.com/adriancampana1"
                    target="_blank"
                >
                    <p>Adrian Campana</p>
                    <span>adriancampana1</span>
                </a>
            </td>

            <td class="repositories">76</td>

            <td class="followers">9589</td>

            <td><button class="remove">Remover</button></td>

    `;
        return tr;
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove();
        });
    }
}
