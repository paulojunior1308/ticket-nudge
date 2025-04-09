import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { sendEmail } from '@/services/emailService';

const TicketForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    serviceDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Adiciona o ticket ao Firestore
      const docRef = await addDoc(collection(db, 'chamados'), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      // Envia email de confirmação
      const emailMessage = `
        <h1>Confirmação de Chamado</h1>
        <p>Olá ${formData.name},</p>
        <p>Seu chamado foi registrado com sucesso!</p>
        <p><strong>Detalhes do chamado:</strong></p>
        <ul>
          <li><strong>Nome:</strong> ${formData.name}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Setor:</strong> ${formData.department}</li>
          <li><strong>Data:</strong> ${new Date(formData.serviceDate).toLocaleDateString('pt-BR')}</li>
        </ul>
        <p>Atenciosamente,<br>Equipe de Suporte TI - SESC Pompeia</p>
      `;

      await sendEmail(formData.email, 'Confirmação de Chamado', emailMessage);
      alert('Chamado criado e email enviado com sucesso!');
      
      // Limpa o formulário
      setFormData({
        name: '',
        email: '',
        department: '',
        serviceDate: '',
      });
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      alert('Erro ao criar chamado');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Novo Chamado</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Nome:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Setor:</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione um setor</option>
          <option value="Administrativo">Administrativo</option>
          <option value="Financeiro">Financeiro</option>
          <option value="RH">RH</option>
          <option value="TI">TI</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Data do Atendimento:</label>
        <input
          type="date"
          name="serviceDate"
          value={formData.serviceDate}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Criar Chamado
      </button>
    </form>
  );
};

export default TicketForm; 