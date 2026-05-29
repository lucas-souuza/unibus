package br.com.unibus.unibus_app.controller;

import br.com.unibus.unibus_app.model.Usuario;
import br.com.unibus.unibus_app.service.OcorrenciaService;
import br.com.unibus.unibus_app.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class AuthViewController {

    private final UsuarioService service;
    private final OcorrenciaService ocorrenciaService;

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/cadastro")
    public String cadastroPage() {
        return "cadastro";
    }

    @GetMapping("/")
    public String homePage(Authentication authentication, Model model) {
        model.addAttribute("ocorrencias", ocorrenciaService.listarTodasPorRecencia());

        if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())) {

            Usuario usuario = service.buscarPorEmail(authentication.getName());

            if (usuario != null) {
                model.addAttribute("usuarioNome", usuario.getNome());
                model.addAttribute("usuarioDescricao", "Aluno UNIRIO");
                model.addAttribute("usuarioIniciais", gerarIniciais(usuario.getNome()));
            }
        }

        return "index";
    }

    @PostMapping("/cadastro")
    public String cadastrar(@RequestParam String nome,
                            @RequestParam String email,
                            @RequestParam String senha,
                            RedirectAttributes attrs) {
        try {
            Usuario u = new Usuario();
            u.setNome(nome);
            u.setEmail(email);
            u.setSenha(senha);
            service.cadastrar(u);
            return "redirect:/login?cadastroOk";

        } catch (RuntimeException e) {
            attrs.addFlashAttribute("mensagemErro", e.getMessage());
            return "redirect:/login?tab=cadastro";
        }
    }

    private String gerarIniciais(String nome) {
        if (nome == null || nome.isBlank()) return "US";

        String[] partes = nome.trim().split("\\s+");
        if (partes.length == 1) {
            return partes[0].substring(0, Math.min(2, partes[0].length())).toUpperCase();
        }

        return (partes[0].substring(0, 1) + partes[partes.length - 1].substring(0, 1)).toUpperCase();
    }
}