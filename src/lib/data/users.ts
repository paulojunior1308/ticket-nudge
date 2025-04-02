interface UserSuggestion {
  name: string;
  email: string;
  department: string;
}

export const userSuggestions: UserSuggestion[] = [
  {
    name: "Laura",
    email: "nti.pompeia@sescsp.org.br",
    department: "Programação"
  },
  {
    name: "Alexandre",
    email: "nti.pompeia@sescsp.org.br",
    department: "Bilheteria"
  },
  {
    name: "Paulo",
    email: "pauloesjr2@gmail.com",
    department: "Almoxarifado Geral"
  },
  {
    name: "João",
    email: "nti.pompeia@sescsp.org.br",
    department: "Programação"
  },
  {
    name: "Simone",
    email: "nti.pompeia@sescsp.org.br",
    department: "RH"
  },
  {
    name: "Viviane",
    email: "nti.pompeia@sescsp.org.br",
    department: "Compras"
  },
  {
    name: "Fabio Kurog",
    email: "nti.pompeia@sescsp.org.br",
    department: "Odontologia"
  }
];

export const addUserSuggestion = (user: UserSuggestion) => {
  // Verifica se o usuário já existe
  const exists = userSuggestions.some(
    u => u.name.toLowerCase() === user.name.toLowerCase() && 
    u.email.toLowerCase() === user.email.toLowerCase()
  );

  // Se não existir, adiciona à lista
  if (!exists) {
    userSuggestions.push(user);
  }
}; 